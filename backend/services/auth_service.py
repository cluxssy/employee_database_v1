import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from backend.repositories.user_repo import UserRepository
from passlib.hash import pbkdf2_sha256

# In-memory session store (Ideally in a real app, this should be Redis or DB Table)
# Since we are refactoring, we can keep it here but expose methods to manage it.
# Or better, move it to the service class.
ACTIVE_SESSIONS: Dict[str, Any] = {}

class AuthService:
    def __init__(self):
        self.repo = UserRepository()

    def get_password_hash(self, password: str) -> str:
        return pbkdf2_sha256.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pbkdf2_sha256.verify(plain_password, hashed_password)

    def create_session_token(self) -> str:
        return secrets.token_urlsafe(32)

    def login(self, username: str, password: str) -> Optional[dict]:
        user = self.repo.get_user_by_username(username)
        if not user:
            return None
        
        if not user['is_active']:
            raise ValueError("Account is deactivated")
        
        if not self.verify_password(password, user['password_hash']):
            return None
        
        # Success - Update Last Login
        self.repo.update_last_login(username)
        
        # Create Session
        token = self.create_session_token()
        expires = datetime.now() + timedelta(days=1)
        
        user_info = {
            "id": user['id'],
            "username": user['username'],
            "role": user['role'],
            "employee_code": user['employee_code']
        }
        
        ACTIVE_SESSIONS[token] = {
            "user": user_info,
            "expires_at": expires
        }
        
        return {"token": token, "user": user_info, "expires": expires}

    def logout(self, token: str):
        if token in ACTIVE_SESSIONS:
            del ACTIVE_SESSIONS[token]

    def get_session_user(self, token: str) -> Optional[dict]:
        if not token or token not in ACTIVE_SESSIONS:
            return None
            
        session = ACTIVE_SESSIONS[token]
        if datetime.now() > session['expires_at']:
            del ACTIVE_SESSIONS[token]
            return None
            
        return session['user']

    def create_user(self, username: str, password: str, role: str, employee_code: str = None) -> dict:
        existing = self.repo.get_user_by_username(username)
        if existing:
            raise ValueError(f"User {username} already exists")
            
        password_hash = self.get_password_hash(password)
        self.repo.create_user(username, password_hash, role, employee_code)
        
        return {"success": True, "message": f"User {username} created successfully"}

    def delete_user(self, username: str):
        existing = self.repo.get_user_by_username(username)
        if not existing:
             raise ValueError("User not found")
        self.repo.delete_user(username)
        return True

