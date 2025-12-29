from fastapi import APIRouter, HTTPException, Response, Request, Depends
from pydantic import BaseModel
import hashlib
import secrets
from datetime import datetime, timedelta
from backend.database import get_db_connection

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Session storage (in-memory for now, use Redis in production)
active_sessions = {}

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    employee_code: str | None
    is_active: bool

from passlib.hash import pbkdf2_sha256

def verify_password(plain_password, hashed_password):
    return pbkdf2_sha256.verify(plain_password, hashed_password)

def create_session_token() -> str:
    """Generate a secure session token"""
    return secrets.token_urlsafe(32)

def get_current_user(request: Request):
    """Dependency to get current user from session"""
    session_token = request.cookies.get("session_token")
    
    if not session_token or session_token not in active_sessions:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_data = active_sessions[session_token]
    
    # Check if session expired (24 hours)
    if datetime.now() > session_data["expires_at"]:
        del active_sessions[session_token]
        raise HTTPException(status_code=401, detail="Session expired")
    
    return session_data["user"]

def require_role(allowed_roles: list[str]):
    """Decorator to check if user has required role"""
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403, 
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker


@router.post("/login")
def login(credentials: LoginRequest, response: Response):
    """
    Authenticate user and create session
    """
    conn = get_db_connection()
    c = conn.cursor()
    
    try:

        
        # Find user
        c.execute("""
            SELECT id, username, password_hash, role, employee_code, is_active
            FROM users 
            WHERE username = ?
        """, (credentials.username,))
        
        user = c.fetchone()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        user_dict = dict(user)
        
        # Check if account is active
        if not user_dict["is_active"]:
            raise HTTPException(status_code=403, detail="Account is deactivated")
        
        # Verify password
        if not verify_password(credentials.password, user_dict["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        
        # Create session token
        session_token = create_session_token()
        expires_at = datetime.now() + timedelta(days=1)
        
        # Store session
        active_sessions[session_token] = {
            "user": {
                "id": user_dict["id"],
                "username": user_dict["username"],
                "role": user_dict["role"],
                "employee_code": user_dict["employee_code"]
            },
            "expires_at": expires_at
        }
        
        # Update last login
        c.execute("""
            UPDATE users 
            SET last_login = CURRENT_TIMESTAMP 
            WHERE id = ?
        """, (user_dict["id"],))
        conn.commit()
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            max_age=86400,  # 24 hours
            samesite="lax",
            path="/"
        )
        
        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user_dict["id"],
                "username": user_dict["username"],
                "role": user_dict["role"],
                "employee_code": user_dict["employee_code"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.post("/logout")
def logout(request: Request, response: Response):
    """
    Logout user and destroy session
    """
    session_token = request.cookies.get("session_token")
    
    if session_token and session_token in active_sessions:
        del active_sessions[session_token]
    
    response.delete_cookie("session_token", path="/", samesite="lax")
    
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user info
    """
    return {
        "success": True,
        "user": current_user
    }


@router.get("/check")
def check_auth(request: Request):
    """
    Check if user is authenticated (for frontend)
    """
    session_token = request.cookies.get("session_token")
    
    if not session_token or session_token not in active_sessions:
        return {"authenticated": False}
    
    session_data = active_sessions[session_token]
    
    # Check if session expired
    if datetime.now() > session_data["expires_at"]:
        del active_sessions[session_token]
        return {"authenticated": False}
    
    return {
        "authenticated": True,
        "user": session_data["user"]
    }
