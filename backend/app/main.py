from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.settings import settings
from db.database import engine, Base
from routes import auth, trips, vehicles, drivers, fuel_logs, expenses, analytics

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(trips.router, prefix=settings.API_V1_STR)
app.include_router(vehicles.router, prefix=settings.API_V1_STR)
app.include_router(drivers.router, prefix=settings.API_V1_STR)
app.include_router(fuel_logs.router, prefix=settings.API_V1_STR)
app.include_router(expenses.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    print(f"Starting {settings.PROJECT_NAME}")


@app.get("/")
def root():
    return {
        "message": "TransitOps is running 🚀",
        "project_name": settings.PROJECT_NAME,
        "api_v1": settings.API_V1_STR,
    }

