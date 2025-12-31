from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import Routers
from backend.routers import auth, employees, assets, performance, hr_activity, dashboard, admin, onboarding
from backend.database import DATA_DIR, get_db_connection

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
app.include_router(performance.router)
app.include_router(hr_activity.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
app.include_router(onboarding.router)

# Ensure data dir
os.makedirs(DATA_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "EwandzDigital HRMS API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
