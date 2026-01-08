from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import Routers (v1)
from backend.api.v1 import (
    auth, 
    employees, 
    assets, 
    dashboard, 
    admin, 
    onboarding, 
    attendance, 
    assessments, 
    training
)
from backend.database import DATA_DIR

app = FastAPI(title="EwandzDigital HRMS API")

# CORS
origins = [
    "http://localhost:3000", # Next.js
    "http://localhost:3001", # React Colleague
    "http://localhost:8000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files
app.mount("/static", StaticFiles(directory=DATA_DIR), name="static")

# Include Routers
app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(assets.router)
# app.include_router(performance.router) # Deprecated
app.include_router(training.router) # Replaces hr_activity
app.include_router(dashboard.router)
app.include_router(admin.router)
app.include_router(onboarding.router)
app.include_router(attendance.router)
app.include_router(assessments.router)

# Ensure data dir
os.makedirs(DATA_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "EwandzDigital HRMS API is running (v1 Refactored)"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
