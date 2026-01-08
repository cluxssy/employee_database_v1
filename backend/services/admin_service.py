from typing import List, Dict, Any
from backend.repositories.admin_repo import AdminRepository
from backend.services.auth_service import AuthService # Reuse for create/delete user logic

class AdminService:
    def __init__(self):
        self.repo = AdminRepository()
        self.auth_service = AuthService()

    def list_users(self):
        return self.repo.get_all_users()

    def create_user(self, username: str, password: str, role: str, actor: str):
        if role not in ['Admin', 'HR', 'Management']:
             raise ValueError("Invalid role")
             
        # Use auth service to create user (handles password hashing)
        # Note: AuthService.create_user handles 'username exists' check
        try:
             self.auth_service.create_user(username, password, role)
             self.repo.log_action(actor, "CREATE_USER", f"Created user {username} with role {role}")
             return {"message": "User created successfully"}
        except ValueError as e:
             raise ValueError(str(e))

    def delete_user(self, user_id: int, actor: str):
        user = self.repo.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        username = user['username']
        if username == actor:
            raise ValueError("Cannot delete your own account")
            
        self.auth_service.delete_user(username)
        self.repo.log_action(actor, "DELETE_USER", f"Deleted user {username}")
        
        return {"message": f"User {username} deleted"}

    def get_logs(self):
        return self.repo.get_logs()
