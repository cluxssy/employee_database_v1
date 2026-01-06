from fastapi import APIRouter, HTTPException, Depends, Body, Form, File, UploadFile
from backend.database import get_db_connection, DATA_DIR
from backend.routers.auth import require_role, get_password_hash
from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime, timedelta
import sqlite3
import os
import shutil

router = APIRouter(
    prefix="/api/onboarding",
    tags=["onboarding"]
)

# --- Models ---
class InviteRequest(BaseModel):
    name: str
    email: str
    role: str = "Employee"
    department: Optional[str] = None
    designation: Optional[str] = None

class InviteResponse(BaseModel):
    id: int
    token: str
    name: str
    email: str
    status: str
    created_at: str
    expires_at: Optional[str]

class OnboardingCompletion(BaseModel):
    token: str
    password: str
    # Additional Profile Data
    contact_number: str
    dob: str
    current_address: str
    permanent_address: str
    education_details: Optional[str] = None

# --- Endpoints ---

@router.post("/invite", dependencies=[Depends(require_role(["Admin", "HR"]))])
def send_invite(invite: InviteRequest):
    conn = get_db_connection()
    c = conn.cursor()
    
    # Check if email already has pending invite or is existing user
    existing_user = c.execute("SELECT 1 FROM users WHERE username = ?", (invite.email,)).fetchone()
    if existing_user:
        conn.close()
        raise HTTPException(status_code=400, detail="User with this email already exists.")
        
    pending_invite = c.execute("SELECT 1 FROM onboarding_invites WHERE email = ? AND status = 'Pending'", (invite.email,)).fetchone()
    if pending_invite:
        conn.close()
        raise HTTPException(status_code=400, detail="Pending invite already exists for this email.")

    token = str(uuid.uuid4())
    expires_at = datetime.now() + timedelta(days=7)
    
    try:
        c.execute('''
            INSERT INTO onboarding_invites (token, email, name, role, department, designation, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (token, invite.email, invite.name, invite.role, invite.department, invite.designation, expires_at))
        
        conn.commit()
        invite_id = c.lastrowid
        conn.close()
        
        # In a real app, send email here. For now return the link.
        onboarding_link = f"/onboard?token={token}"
        
        return {
            "success": True, 
            "message": "Invitation created successfully",
            "token": token,
            "link": onboarding_link
        }
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/invites", dependencies=[Depends(require_role(["Admin", "HR"]))])
def get_invites():
    conn = get_db_connection()
    invites = conn.execute("SELECT * FROM onboarding_invites ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(i) for i in invites]

@router.delete("/invite/{invite_id}", dependencies=[Depends(require_role(["Admin", "HR"]))])
def revoke_invite(invite_id: int):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("UPDATE onboarding_invites SET status = 'Revoked' WHERE id = ?", (invite_id,))
    conn.commit()
    conn.close()
    return {"success": True, "message": "Invite revoked"}

@router.post("/verify-token")
def verify_token(data: dict = Body(...)):
    token = data.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token required")
        
    conn = get_db_connection()
    invite = conn.execute("SELECT * FROM onboarding_invites WHERE token = ? AND status = 'Pending'", (token,)).fetchone()
    conn.close()
    
    if not invite:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    # Check expiry
    # Check expiry
    try:
        expires_at = datetime.strptime(invite['expires_at'], '%Y-%m-%d %H:%M:%S.%f')
    except ValueError:
        expires_at = datetime.strptime(invite['expires_at'], '%Y-%m-%d %H:%M:%S')
        
    if datetime.now() > expires_at:
         raise HTTPException(status_code=400, detail="Token expired")
         
    return {
        "valid": True, 
        "email": invite['email'], 
        "name": invite['name'],
        "role": invite['role'],
        "department": invite['department'],
        "designation": invite['designation']
    }

@router.post("/complete")
def complete_onboarding(
    token: str = Form(...),
    password: str = Form(...),
    contact_number: str = Form(...),
    emergency_contact: str = Form(...),  # Added
    dob: str = Form(...),
    current_address: str = Form(...),
    permanent_address: str = Form(...),
    education_details: Optional[str] = Form(None),
    primary_skills: Optional[str] = Form(None),   # Added
    secondary_skills: Optional[str] = Form(None), # Added
    photo_file: Optional[UploadFile] = File(None),
    cv_file: Optional[UploadFile] = File(None),
    id_proof_file: Optional[UploadFile] = File(None)
):
    conn = get_db_connection()
    c = conn.cursor()
    
    # 1. Verify Token
    invite = c.execute("SELECT * FROM onboarding_invites WHERE token = ? AND status = 'Pending'", (token,)).fetchone()
    if not invite:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid token")

    try:
        # 2. Generate Employee Code (Simple Logic: EMP + ID)
        while True:
            count = c.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
            # Add a small random component or just check existence to be safe against race conditions/deletions
            # Since IDs are not reliable if rows are deleted, let's try to find a gap or just increment until unique
            # Better approach: Get max numeric part
            
            # Simple retry logic:
            emp_code = f"EMP{str(count + 1).zfill(4)}"
            
            # Check if exists (handling deleted rows case where count < max_id)
            if not c.execute("SELECT 1 FROM employees WHERE employee_code = ?", (emp_code,)).fetchone():
                break
            
            # If collision, we need a better strategy. 
            # In a real app, use a sequence or UUID. 
            # Here, let's just increment count locally until we find a free slot
            # Or simpler: find max code
            max_code_row = c.execute("SELECT employee_code FROM employees ORDER BY employee_code DESC LIMIT 1").fetchone()
            if max_code_row:
                last_code = max_code_row[0]
                try:
                    num_part = int(last_code.replace("EMP", ""))
                    emp_code = f"EMP{str(num_part + 1).zfill(4)}"
                    break
                except:
                    pass # Fallback to count+1 logic and hope
            
            # Fallback if logic fails (e.g. empty table or weird codes)
            if not c.execute("SELECT 1 FROM employees WHERE employee_code = ?", (emp_code,)).fetchone():
                break
            
            # If we still conflict (highly unlikely unless concurrent), force a random suffix or increment in a loop
            import random
            emp_code = f"EMP{str(count + 1 + random.randint(1, 1000)).zfill(4)}"
            break

        # 3. Create User Account (Inactive initially)
        password_hash = get_password_hash(password)
        c.execute("INSERT INTO users (username, password_hash, role, employee_code, is_active) VALUES (?, ?, ?, ?, 0)", 
                  (invite['email'], password_hash, invite['role'], emp_code))
        
        # 4. File Saving Logic
        UPLOAD_DIR = os.path.join(DATA_DIR, "uploads")
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        def save_file_to_disk(uploaded_file, code):
            if not uploaded_file: return None
            user_subdir = os.path.join("uploads", code)
            full_user_dir = os.path.join(DATA_DIR, user_subdir)
            os.makedirs(full_user_dir, exist_ok=True)
            file_path = os.path.join(full_user_dir, uploaded_file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(uploaded_file.file, buffer)
            return os.path.join(user_subdir, uploaded_file.filename)

        photo_path = save_file_to_disk(photo_file, emp_code)
        cv_path = save_file_to_disk(cv_file, emp_code)
        id_proof_path = save_file_to_disk(id_proof_file, emp_code)

        # 5. Create Employee Record (Pending Approval)
        c.execute('''
            INSERT INTO employees (
                employee_code, name, email_id, contact_number, emergency_contact, dob, 
                current_address, permanent_address, education_details,
                team, designation, employment_status, doj,
                photo_path, cv_path, id_proofs
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            emp_code, 
            invite['name'], 
            invite['email'], 
            contact_number,
            emergency_contact,  # Added
            dob,
            current_address, 
            permanent_address,
            education_details,
            invite['department'], 
            invite['designation'], 
            'Pending Approval', 
            datetime.now().strftime('%Y-%m-%d'),
            photo_path,
            cv_path,
            id_proof_path
        ))
        
        # 6. Insert Skills
        c.execute('''
            INSERT INTO skill_matrix (
                employee_code, candidate_name, primary_skillset,
                secondary_skillset, cv_upload
            ) VALUES (?, ?, ?, ?, ?)
        ''', (
            emp_code,
            invite['name'],
            primary_skills,
            secondary_skills,
            cv_path
        ))
        
        # 7. Mark Invite as Completed
        c.execute("UPDATE onboarding_invites SET status = 'Completed' WHERE token = ?", (token,))
        
        conn.commit()
        return {"success": True, "message": "Onboarding completed successfully. Please login."}
        
    except sqlite3.IntegrityError as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/approvals", dependencies=[Depends(require_role(["Admin", "HR"]))])
def get_pending_approvals():
    conn = get_db_connection()
    employees = conn.execute("SELECT * FROM employees WHERE employment_status = 'Pending Approval'").fetchall()
    conn.close()
    return [dict(e) for e in employees]

@router.post("/approve/{employee_code}", dependencies=[Depends(require_role(["Admin", "HR"]))])
def approve_onboarding(
    employee_code: str,
    reporting_manager: str = Form(None),
    employment_type: str = Form("Full Time"),
    pf_included: str = Form("No"),
    mediclaim_included: str = Form("No"),
    notes: str = Form(None)
):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Update Employee with HR-provided details and Activate
        c.execute('''
            UPDATE employees 
            SET employment_status = 'Active',
                reporting_manager = ?,
                employment_type = ?,
                pf_included = ?,
                mediclaim_included = ?,
                notes = ?
            WHERE employee_code = ?
        ''', (reporting_manager, employment_type, pf_included, mediclaim_included, notes, employee_code))
        
        # Activate User Logic
        c.execute("UPDATE users SET is_active = 1 WHERE employee_code = ?", (employee_code,))
        
        conn.commit()
        return {"success": True, "message": f"Employee {employee_code} approved successfully"}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
