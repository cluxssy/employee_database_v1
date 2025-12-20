from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import sqlite3
import os
import sys

# Add parent directory to path so we can import 'backend.auth'
# This assumes main.py is in /backend/
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from backend.auth import verify_user, create_user, get_all_users

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

# STATIC FILES (Images/CVs)
# Serve the 'data' directory at '/static'
# We use parent_dir defined above
DATA_DIR = os.path.join(parent_dir, 'data')
if not os.path.exists(DATA_DIR):
    # Fallback to create it if missing, though it should exist
    os.makedirs(DATA_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=DATA_DIR), name="static")

# DATABASE CONFIG
DB_PATH = os.path.join(DATA_DIR, 'employee.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# MODELS
class LoginRequest(BaseModel):
    username: str
    password: str

# AUTH ENDPOINTS

@app.get("/")
def read_root():
    return {"message": "EwandzDigital HRMS API is running "}

@app.post("/api/auth/login")
def login(request: LoginRequest):
    print(f"Login attempt: {request.username}") 
    is_valid, role = verify_user(request.username, request.password)
    if is_valid:
        return {"status": "success", "username": request.username, "role": role}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# EMPLOYEE ENDPOINTS (Basic Read)

@app.get("/api/employees")
def get_employees():
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Fetch basic list
        c.execute("SELECT employee_code, name, designation, team, email_id, photo_path FROM employees")
        rows = c.fetchall()
        employees = [dict(row) for row in rows]
        return employees
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/employee/{employee_code}")
def get_employee(employee_code: int):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("SELECT * FROM employees WHERE employee_code = ?", (employee_code))
        row = c.fetchone()
        if row:
            return dict(row)
        else:
            raise HTTPException(status_code=404, detail="Employee not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
