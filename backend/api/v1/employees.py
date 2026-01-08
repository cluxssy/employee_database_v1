from fastapi import APIRouter, HTTPException, Depends, Form, File, UploadFile, Body
from typing import List
from backend.api.v1.auth import require_role, get_current_user
from backend.services.employee_service import EmployeeService
from backend.schemas.employee import UpdateEmployeeRequest, OffboardRequest
from backend.database import DATA_DIR
import os
import shutil

router = APIRouter(prefix="/api", tags=["employees"])

def get_service():
    return EmployeeService()

@router.get("/employees", dependencies=[Depends(require_role(["Admin", "HR", "Management", "Employee"]))])
def get_employees(service: EmployeeService = Depends(get_service)):
    return service.get_all_employees()

@router.get("/employee/{employee_code}", dependencies=[Depends(require_role(["Admin", "HR", "Management", "Employee"]))])
def get_employee(employee_code: str, service: EmployeeService = Depends(get_service)):
    employee = service.get_employee_full_details(employee_code)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.post("/employee", dependencies=[Depends(require_role(["Admin", "HR"]))])
async def create_employee(
    code: str = Form(...),
    name: str = Form(...),
    dob: str = Form(...),
    phone: str = Form(...),
    emergency: str = Form(...),
    email: str = Form(...),
    doj: str = Form(...),
    team: str = Form(...),
    role: str = Form(...),
    type: str = Form(...),
    manager: str = Form(...),
    location: str = Form(...),
    current_address: str = Form(None),
    permanent_address: str = Form(None),
    pf: str = Form(None),
    mediclaim: str = Form(None),
    notes: str = Form(None),
    primary_skillset: str = Form(None),
    secondary_skillset: str = Form(None),
    experience_years: float = Form(None),
    photo_file: UploadFile = File(None),
    cv_file: UploadFile = File(None),
    id_proof_file: UploadFile = File(None),
    service: EmployeeService = Depends(get_service)
):
    # File handling logic (kept in Router for now as it deals with UploadFile types)
    # Ideally, file saving should be a utility called by Service, but UploadFile is an API type.
    base_uploads_dir = os.path.join(DATA_DIR, 'uploads')
    
    def save_file(uploaded_file, folder_name, suffix):
        if not uploaded_file: return None
        folder_path = os.path.join(base_uploads_dir, folder_name)
        os.makedirs(folder_path, exist_ok=True)
        ext = os.path.splitext(uploaded_file.filename)[1]
        safe_code = code.replace('/', '_').replace('\\', '_').strip()
        filename = f"{safe_code}_{suffix}{ext}"
        filepath = os.path.join(folder_path, filename)
        with open(filepath, "wb") as buffer:
             shutil.copyfileobj(uploaded_file.file, buffer)
        return f"uploads/{folder_name}/{filename}"

    photo_path = save_file(photo_file, 'pfps', 'pfp')
    cv_path = save_file(cv_file, 'cvs', 'cv')
    id_proofs_path = save_file(id_proof_file, 'id', 'id_proof')

    data = {
        "code": code, "name": name, "dob": dob, "phone": phone, "emergency": emergency,
        "email": email, "doj": doj, "team": team, "role": role, "type": type,
        "manager": manager, "location": location, "current_address": current_address,
        "permanent_address": permanent_address, "pf": pf, "mediclaim": mediclaim, "notes": notes,
        "primary_skillset": primary_skillset, "secondary_skillset": secondary_skillset,
        "experience_years": experience_years, "photo_path": photo_path, "cv_path": cv_path,
        "id_proofs": id_proofs_path
    }

    try:
        return service.create_employee(data)
    except ValueError as e:
         raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@router.put("/employee/{employee_code}", dependencies=[Depends(require_role(["Admin", "HR", "Employee"]))])
def update_employee(employee_code: str, data: dict = Body(...), service: EmployeeService = Depends(get_service)):
    try:
        return service.update_employee(employee_code, data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/employee/{employee_code}", dependencies=[Depends(require_role(["Admin", "HR"]))])
def delete_employee(employee_code: str, service: EmployeeService = Depends(get_service)):
    try:
        return service.delete_employee(employee_code)
    except ValueError as e:
         raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@router.get("/options", dependencies=[Depends(require_role(["Admin", "HR", "Management", "Employee"]))])
def get_dropdown_options(service: EmployeeService = Depends(get_service)):
     return service.get_options()

@router.post("/employee/{employee_code}/offboard", dependencies=[Depends(require_role(["Admin", "HR"]))])
def offboard_employee(employee_code: str, data: OffboardRequest, service: EmployeeService = Depends(get_service)):
    try:
        return service.offboard_employee(employee_code, data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
