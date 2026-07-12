from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import cast, String

from app import schemas, utils, oauth2
from app.enums import UserRole
from db import models
from db.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/roles")
def get_roles():
    """Returns available roles and matching demo credentials for frontend dropdown selector."""
    return {
        "roles": [
            {
                "role": UserRole.FLEET_MANAGER.value,
                "name": "Fleet Manager",
                "demo_email": "fleet@transitops.demo",
                "demo_password": "transitops2026",
                "route": "/fleet-manager",
                "description": "Fleet & Maintenance management"
            },
            {
                "role": UserRole.DISPATCHER.value,
                "name": "Dispatcher",
                "demo_email": "dispatcher@transitops.demo",
                "demo_password": "transitops2026",
                "route": "/dispatcher",
                "description": "Live Dispatch & Routes"
            },
            {
                "role": UserRole.SAFETY_OFFICER.value,
                "name": "Safety Officer",
                "demo_email": "safety@transitops.demo",
                "demo_password": "transitops2026",
                "route": "/safety-officer",
                "description": "Safety & Compliance inspection"
            },
            {
                "role": UserRole.FINANCIAL_ANALYST.value,
                "name": "Financial Analyst",
                "demo_email": "finance@transitops.demo",
                "demo_password": "transitops2026",
                "route": "/financial-analyst",
                "description": "Financial & Fuel analytics"
            },
        ]
    }


@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check global email uniqueness
    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pwd = utils.hash_password(user.password)
    selected_role = user.role.value if user.role else UserRole.DISPATCHER.value

    new_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_pwd,
        role=selected_role,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user



@router.post("/login", response_model=schemas.Token)
def login(user_credentials: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Find user by username or email — no role selection
    user = db.query(models.User).filter(
        (models.User.email == user_credentials.username) | (models.User.name == user_credentials.username)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials"
        )

    # Check lockout status (Account locked after 5 failed attempts)
    now = datetime.now(timezone.utc)
    if user.locked_until and user.locked_until > now:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account locked after 5 failed attempts. Please try again later.",
        )

    if not utils.verify_password(user_credentials.password, user.hashed_password):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        if user.failed_login_attempts >= 5:
            user.locked_until = now + timedelta(minutes=15)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid credentials. Account locked after 5 failed attempts.",
            )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid Credentials"
        )

    # Successful login: reset failed attempts
    user.failed_login_attempts = 0
    user.locked_until = None

    # Role comes from the database, not from the client
    token_data = {"user_id": str(user.id), "role": user.role}
    access_token = oauth2.create_access_token(data=token_data)
    refresh_token = oauth2.create_refresh_token(data=token_data)

    # Clean up expired refresh tokens for this user
    expire_threshold = now - timedelta(minutes=oauth2.REFRESH_TOKEN_EXPIRE_MINUTES)
    db.query(models.RefreshToken).filter(
        models.RefreshToken.user_id == user.id,
        models.RefreshToken.updated_at < expire_threshold
    ).delete(synchronize_session=False)

    db_token = models.RefreshToken(user_id=user.id, token=refresh_token)
    db.add(db_token)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(oauth2.get_current_active_user)):
    return current_user


@router.patch("/me", response_model=schemas.UserOut)
def update_me(
    update_data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(oauth2.get_current_active_user),
):
    if update_data.name is not None:
        current_user.name = update_data.name
    if update_data.email is not None:
        if update_data.email != current_user.email:
            # Global email uniqueness check
            existing = db.query(models.User).filter(
                models.User.email == update_data.email,
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email already registered")
            current_user.email = update_data.email
    if update_data.phone is not None:
        current_user.phone = update_data.phone
    if update_data.address is not None:
        current_user.address = update_data.address
    if update_data.profile_picture is not None:
        current_user.profile_picture = update_data.profile_picture

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/refresh", response_model=schemas.Token)
def refresh_token(token_data: schemas.TokenRefresh, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_payload = oauth2.verify_token(token_data.refresh_token, credentials_exception)

    db_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == token_data.refresh_token
    ).first()

    if not db_token or db_token.is_revoked:
        raise credentials_exception

    user = db.query(models.User).filter(cast(models.User.id, String) == token_payload.id).first()
    if user is None or not user.is_active:
        raise credentials_exception

    new_token_data = {"user_id": str(user.id), "role": user.role}
    new_access_token = oauth2.create_access_token(data=new_token_data)

    return {
        "access_token": new_access_token,
        "refresh_token": db_token.token,
        "token_type": "bearer",
    }
