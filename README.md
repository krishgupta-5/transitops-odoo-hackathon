# Backend Setup

## 1. Navigate to the Backend Directory

```bash
cd backend
```

## 2. Create a Virtual Environment

### Windows

```bash
python -m venv .venv
```

Activate the virtual environment:

```bash
.venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## 3. Upgrade pip

```bash
python -m pip install --upgrade pip
```

## 4. Install Dependencies

```bash
pip install -r requirements.txt
```

## 5. Start the Development Server

```bash
uvicorn app.main:app --reload
```

The API will be available at:

- **API:** http://127.0.0.1:8000
- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

## Useful Commands

Generate/Update `requirements.txt`

```bash
pip freeze > requirements.txt
```

Deactivate the virtual environment

```bash
deactivate
```