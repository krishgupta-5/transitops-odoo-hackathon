from fastapi import FastAPI

app = FastAPI(
    title="TransitOps API",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "TransitOps is running 🚀"}