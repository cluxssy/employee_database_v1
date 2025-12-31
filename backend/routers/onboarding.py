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
    dob: str = Form(...),
    current_address: str = Form(...),
    permanent_address: str = Form(...),
    education_details: Optional[str] = Form(None),
    photo_file: Optional[UploadFile] = File(None),
    cv_file: Optional[UploadFile] = File(None),
    id_proof_file: Optional[UploadFile] = File(None)
):
    # Construct data object to match previous logic (reusing OnboardingCompletion model for consistency if needed, or just using a dict/object wrapper)
    # We can just use a SimpleNamespace or a quick dict to keep the rest of the logic similar, 
    # OR better yet, instantiate the model to validate the fields if we want, but simple access is fine.
    
    # Construct data object using the Pydantic model for validation
    data = OnboardingCompletion(
        token=token,
        password=password,
        contact_number=contact_number,
        dob=dob,
        current_address=current_address,
        permanent_address=permanent_address,
        education_details=education_details
    )

    conn = get_db_connection()
    c = conn.cursor()
    
    # 1. Verify Token again
    invite = c.execute("SELECT * FROM onboarding_invites WHERE token = ? AND status = 'Pending'", (data.token,)).fetchone()
    if not invite:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid token")

    try:
        # 2. Generate Employee Code (Simple Logic: EMP + ID)
        # We need to get the next ID first
        count = c.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
        emp_code = f"EMP{str(count + 1).zfill(4)}"

        # 3. Create User Account
        # Username = Email
        password_hash = get_password_hash(data.password)
        # Added employee_code to user record
        c.execute("INSERT INTO users (username, password_hash, role, employee_code, is_active) VALUES (?, ?, ?, ?, 1)", 
                  (invite['email'], password_hash, invite['role'], emp_code))
        
        # 4. Create Employee Record
        
        # File Saving Logic
        # Store in data/uploads so it is served via /static mount
        UPLOAD_DIR = os.path.join(DATA_DIR, "uploads")
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        def save_file_to_disk(uploaded_file, code):
            if not uploaded_file: return None
            # store in data/uploads/EMPXXXX/filename
            # We want to return the relative path from DATA_DIR, e.g. "uploads/EMPXXXX/filename"
            
            user_subdir = os.path.join("uploads", code)
            full_user_dir = os.path.join(DATA_DIR, user_subdir)
            os.makedirs(full_user_dir, exist_ok=True)
            
            file_path = os.path.join(full_user_dir, uploaded_file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(uploaded_file.file, buffer)
                
            # Return relative path for DB
            return os.path.join(user_subdir, uploaded_file.filename)

        photo_path = save_file_to_disk(photo_file, emp_code)
        cv_path = save_file_to_disk(cv_file, emp_code)
        id_proof_path = save_file_to_disk(id_proof_file, emp_code)

        c.execute('''
            INSERT INTO employees (
                employee_code, name, email_id, contact_number, dob, 
                current_address, permanent_address, education_details,
                team, designation, employment_status, doj,
                photo_path, cv_path, id_proofs
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            emp_code, 
            invite['name'], 
            invite['email'], 
            data.contact_number, 
            data.dob,
            data.current_address, 
            data.permanent_address,
            data.education_details,
            invite['department'], 
            invite['designation'], 
            'Active', 
            datetime.now().strftime('%Y-%m-%d'),
            photo_path,
            cv_path,
            id_proof_path
        ))
        
        # 4. Mark Invite as Completed
        c.execute("UPDATE onboarding_invites SET status = 'Completed' WHERE token = ?", (data.token,))
        
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
