from fastapi import APIRouter, Depends, HTTPException
from backend.api.v1.auth import require_role, get_current_user
from backend.services.dashboard_service import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

def get_service():
    return DashboardService()

@router.get("/stats", dependencies=[Depends(require_role(["Admin", "HR", "Management"]))])
def get_dashboard_stats(service: DashboardService = Depends(get_service)):
    try:
        return service.get_admin_stats()
    except Exception as e:
        print(f"Admin Dashboard Error: {e}")
        # In production log real error, generic return
        return {"error": str(e)}

@router.get("/employee-stats", dependencies=[Depends(require_role(["Employee", "Admin", "HR", "Management"]))])
def get_employee_dashboard_stats(current_user: dict = Depends(get_current_user), service: DashboardService = Depends(get_service)):
    employee_code = current_user.get("employee_code")
    if not employee_code:
        return {"error": "No employee code found for user"}
    
    try:
        return service.get_employee_stats(employee_code)
    except Exception as e:
        print(f"Employee Dashboard Error: {e}")
        return {"error": str(e)}
