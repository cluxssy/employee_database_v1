from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from backend.routers.auth import require_role, get_current_user
from backend.database import get_db_connection
from backend.auth import create_user, delete_user

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(require_role(["Admin"]))]
)

# --- Models ---
class UserCreate(BaseModel):
    username: str
    password: str
    role: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str

class LogResponse(BaseModel):
    id: int
    username: Optional[str]
    action: str
    details: Optional[str]
    ip_address: Optional[str]
    timestamp: datetime

# --- Helper ---
def log_action_db(username: str, action: str, details: str):
    try:
        conn = get_db_connection()
        conn.execute("INSERT INTO audit_logs (username, action, details) VALUES (?, ?, ?)", 
                     (username, action, details))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Logging Failed: {e}")

# --- Endpoints ---

@router.get("/users", response_model=List[UserResponse])
def list_users():
    conn = get_db_connection()
    users = conn.execute("SELECT id, username, role FROM users ORDER BY id").fetchall()
    conn.close()
    return [dict(u) for u in users]

@router.post("/users")
def add_new_user(user: UserCreate, current_user: dict = Depends(get_current_user)):
    # 1. Check if user exists
    conn = get_db_connection()
    exists = conn.execute("SELECT 1 FROM users WHERE username = ?", (user.username,)).fetchone()
    conn.close()
    
    if exists:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    if user.role not in ['Admin', 'HR', 'Management']:
        raise HTTPException(status_code=400, detail="Invalid role")

    # 2. Create User
    success = create_user(user.username, user.password, user.role)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create user")
    
    # 3. Log
    log_action_db(current_user['username'], "CREATE_USER", f"Created user {user.username} with role {user.role}")
    
    return {"message": "User created successfully"}

@router.delete("/users/{user_id}")
def delete_existing_user(user_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    target = conn.execute("SELECT username FROM users WHERE id = ?", (user_id,)).fetchone()
    
    if not target:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    
    username = target['username']
    
    # Prevent deleting yourself
    if username == current_user['username']:
        conn.close()
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    success = delete_user(username) # This function uses 'username'
    conn.close()

    if success:
        log_action_db(current_user['username'], "DELETE_USER", f"Deleted user {username}")
        return {"message": f"User {username} deleted"}
        
    raise HTTPException(status_code=500, detail="Deletion failed")

@router.get("/logs", response_model=List[LogResponse])
def view_logs():
    conn = get_db_connection()
    logs = conn.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100").fetchall()
    conn.close()
    return [dict(l) for l in logs]
