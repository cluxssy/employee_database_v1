from fastapi import APIRouter, HTTPException, Body, Form, File, UploadFile, Depends
from backend.routers.auth import require_role
from backend.database import get_db_connection, DATA_DIR
import sqlite3
import os
import shutil
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/api",
    tags=["employees"]
)

@router.get("/employees", dependencies=[Depends(require_role(["Admin", "HR", "Management"]))])
def get_employees():
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Fetch basic list including new columns if needed (SELECT * is safer during dev, but explicit is better)
        # Using explicit columns to match frontend interface
        c.execute("SELECT employee_code, name, designation, team, email_id, photo_path, employment_status, exit_date FROM employees")
        rows = c.fetchall()
        employees = [dict(row) for row in rows]
        return employees
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/employee/{employee_code}", dependencies=[Depends(require_role(["Admin", "HR", "Management"]))])
def get_employee(employee_code: str):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # 1. Employee Basic Info
        c.execute("SELECT * FROM employees WHERE employee_code = ?", (employee_code,))
        employee = c.fetchone()
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        result = dict(employee)

        # 2. Skill Matrix
        c.execute("SELECT * FROM skill_matrix WHERE employee_code = ?", (employee_code,))
        skills = c.fetchone()
        result['skill_matrix'] = dict(skills) if skills else {}

        # 3. Assets
        c.execute("SELECT * FROM assets WHERE employee_code = ?", (employee_code,))
        assets = c.fetchall()
        result['assets'] = [dict(row) for row in assets]

        # 4. Performance
        c.execute("SELECT * FROM performance WHERE employee_code = ?", (employee_code,))
        performance = c.fetchall()
        result['performance'] = [dict(row) for row in performance]

        # 5. HR Activity
        c.execute("SELECT * FROM hr_activity WHERE employee_code = ?", (employee_code,))
        hr_activity = c.fetchall()
        result['hr_activity'] = [dict(row) for row in hr_activity]

        # 6. KRA Assignments with details (handle gracefully if tables don't exist)
        try:
            c.execute("""
                SELECT 
                    ka.id as assignment_id,
                    ka.kra_id,
                    ka.period,
                    ka.status,
                    ka.self_rating,
                    ka.manager_rating,
                    ka.final_score,
                    ka.comments,
                    ka.assigned_at,
                    kl.name as kra_name,
                    kl.goal_name,
                    kl.description,
                    kl.weightage
                FROM kra_assignments ka
                JOIN kra_library kl ON ka.kra_id = kl.id
                WHERE ka.employee_code = ?
                ORDER BY ka.assigned_at DESC
            """, (employee_code,))
            kra_assignments = c.fetchall()
            result['kra_assignments'] = [dict(row) for row in kra_assignments]
            print(f"Found {len(kra_assignments)} KRA assignments for {employee_code}")
        except Exception as kra_error:
            # If KRA tables don't exist or query fails, just set empty array
            print(f"KRA query failed for {employee_code}: {kra_error}")
            import traceback
            traceback.print_exc()
            result['kra_assignments'] = []

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

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
    # Skills
    primary_skillset: str = Form(None),
    secondary_skillset: str = Form(None),
    experience_years: float = Form(None),
    # Files
    photo_file: UploadFile = File(None),
    cv_file: UploadFile = File(None),
    id_proof_file: UploadFile = File(None)
):
    # --- Validation ---
    
    # 1. Code Prefix (EMP prefix constraint not strict in DB but good to check)
    if not code.startswith("EMP"):
        raise HTTPException(status_code=400, detail="Employee code must start with 'EMP'.")

    # 2. Local Validation (Digits)
    if not phone.isdigit() or len(phone) != 10:
        raise HTTPException(status_code=400, detail="Contact number must be exactly 10 digits.")
    
    if not emergency.isdigit() or len(emergency) != 10:
        raise HTTPException(status_code=400, detail="Emergency contact must be exactly 10 digits.")

    # 3. Age Validation
    try:
        dob_date = datetime.strptime(dob, "%Y-%m-%d")
        doj_date = datetime.strptime(doj, "%Y-%m-%d")
        
        today = datetime.today()
        age = today.year - dob_date.year - ((today.month, today.day) < (dob_date.month, dob_date.day))
        
        if age < 18:
            raise HTTPException(status_code=400, detail="Employee must be at least 18 years old.")
            
        # DOJ Validation (Must be 18 years after DOB)
        hire_age = doj_date.year - dob_date.year - ((doj_date.month, doj_date.day) < (dob_date.month, dob_date.day))
        if hire_age < 18:
            raise HTTPException(status_code=400, detail="Date of Joining must be at least 18 years after Date of Birth.")

    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")


    # --- File Handling ---
    base_uploads_dir = os.path.join(DATA_DIR, 'uploads')

    def save_file(uploaded_file, folder_name, suffix):
        if not uploaded_file: return None
        
        # Create specific folder: uploads/pfps, uploads/cvs, etc.
        folder_path = os.path.join(base_uploads_dir, folder_name)
        os.makedirs(folder_path, exist_ok=True)
        
        # Construct filename: EMP001_pfp.jpg
        ext = os.path.splitext(uploaded_file.filename)[1]
        safe_code = code.replace('/', '_').replace('\\', '_').strip()
        filename = f"{safe_code}_{suffix}{ext}"
        filepath = os.path.join(folder_path, filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(uploaded_file.file, buffer)
            
        # Return path relative to data root (or however frontend expects it)
        # Assuming frontend gets files via static mount of DATA_DIR or similar. 
        # Previously returned f"uploads/{filename}"
        return f"uploads/{folder_name}/{filename}"

    photo_path = save_file(photo_file, 'pfps', 'pfp')
    cv_path = save_file(cv_file, 'cvs', 'cv')
    id_proofs_path = save_file(id_proof_file, 'id', 'id_proof')


    # --- DB Insertion ---
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # 1. Employees Table
        c.execute('''
            INSERT INTO employees (
                employee_code, name, dob, contact_number, emergency_contact, email_id, doj, 
                team, designation, employment_type, reporting_manager, location, 
                current_address, permanent_address,
                pf_included, mediclaim_included, 
                photo_path, cv_path, id_proofs, notes, 
                employment_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
        ''', (
            code, name, dob, phone, emergency, 
            email, doj, team, role, type, 
            manager, location, current_address, permanent_address,
            pf, mediclaim, 
            photo_path, cv_path, id_proofs_path, notes
        ))
        
        # 2. Skill Matrix Table (Basic Info)
        c.execute('''
            INSERT INTO skill_matrix (
                employee_code, candidate_name, primary_skillset,
                secondary_skillset, experience_years, cv_upload
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            code, name, primary_skillset, secondary_skillset,
            experience_years, cv_path
        ))
        
        # Note: Assets, Performance, HR Activity are intentionally omitted as per new requirements.
        
        conn.commit()
        return {"success": True, "message": "Employee added successfully!"}

    except sqlite3.IntegrityError as e:
        if "UNIQUE constraint failed" in str(e):
             raise HTTPException(status_code=400, detail="Employee Code already exists.")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        conn.close()

@router.put("/employee/{employee_code}", dependencies=[Depends(require_role(["Admin", "HR"]))])
def update_employee(employee_code: str, data: dict = Body(...)):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Build dynamic query to allow partial updates
        fields = []
        values = []
        
        # Whitelist allowed fields for update to prevent accidental overwrite of critical data
        allowed_fields = [
            'checklist_bag', 'checklist_mediclaim', 'checklist_pf', 
            'checklist_email_access', 'checklist_groups', 'checklist_relieving_letter',
            'exit_date', 'exit_reason', 'clearance_status', 'employment_status',
            'name', 'designation', 'team'
        ]
        
        for key, value in data.items():
            if key in allowed_fields:
                fields.append(f"{key} = ?")
                values.append(value)
        
        if not fields:
             return {"success": False, "message": "No valid fields provided for update"}
             
        values.append(employee_code)
        query = f"UPDATE employees SET {', '.join(fields)} WHERE employee_code = ?"
        
        c.execute(query, tuple(values))
        conn.commit()
        
        return {"success": True, "message": "Employee updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.delete("/employee/{employee_code}", dependencies=[Depends(require_role(["Admin", "HR"]))])
def delete_employee(employee_code: str):
    """
    Delete an employee and all associated records (skill_matrix, assets, performance, hr_activity).
    """
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Check if employee exists
        c.execute("SELECT employee_code FROM employees WHERE employee_code = ?", (employee_code,))
        if not c.fetchone():
            raise HTTPException(status_code=404, detail="Employee not found")
        
        # Delete from all related tables (cascading delete)
        c.execute("DELETE FROM skill_matrix WHERE employee_code = ?", (employee_code,))
        c.execute("DELETE FROM assets WHERE employee_code = ?", (employee_code,))
        c.execute("DELETE FROM performance WHERE employee_code = ?", (employee_code,))
        c.execute("DELETE FROM hr_activity WHERE employee_code = ?", (employee_code,))
        
        # Delete the employee record
        c.execute("DELETE FROM employees WHERE employee_code = ?", (employee_code,))
        
        conn.commit()
        
        return {"success": True, "message": f"Employee {employee_code} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
