from fastapi import APIRouter, Depends, HTTPException
from typing import List
from backend.api.v1.auth import require_role, get_current_user
from backend.services.admin_service import AdminService
from backend.schemas.admin import UserCreate, UserResponse, LogResponse

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_role(["Admin"]))])

def get_service():
    return AdminService()

@router.get("/users", response_model=List[UserResponse])
def list_users(service: AdminService = Depends(get_service)):
    return service.list_users()

@router.post("/users")
def add_new_user(user: UserCreate, current_user: dict = Depends(get_current_user), service: AdminService = Depends(get_service)):
    try:
        return service.create_user(user.username, user.password, user.role, current_user['username'])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}")
def delete_existing_user(user_id: int, current_user: dict = Depends(get_current_user), service: AdminService = Depends(get_service)):
    try:
        return service.delete_user(user_id, current_user['username'])
    except ValueError as e:
        if "not found" in str(e).lower():
             raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs", response_model=List[LogResponse])
def view_logs(service: AdminService = Depends(get_service)):
    return service.get_logs()
