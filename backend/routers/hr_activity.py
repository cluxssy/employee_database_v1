from fastapi import APIRouter, HTTPException, Body, Depends
from backend.database import get_db_connection
from backend.routers.auth import require_role
import sqlite3

router = APIRouter(
    prefix="/api/training",
    tags=["training"],
    dependencies=[Depends(require_role(["Admin", "HR"]))]
)

# --- 1. Training Library ---

@router.get("/programs")
def get_training_programs():
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("SELECT * FROM training_library ORDER BY created_at DESC")
        rows = c.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

@router.post("/programs")
def create_training_program(data: dict = Body(...)):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("""
            INSERT INTO training_library (program_name, description, default_duration)
            VALUES (?, ?, ?)
        """, (data.get('program_name'), data.get('description'), data.get('default_duration')))
        conn.commit()
        return {"success": True, "message": "Training Program created successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Program name already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# --- 2. Training Assignments (HR Activity) ---

@router.get("/assignments")
def get_all_assignments():
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Join with employees to get names, join with library to get program names
        c.execute("""
            SELECT 
                h.id, 
                h.employee_code, 
                e.name as employee_name,
                h.program_id,
                t.program_name,
                h.training_date,
                h.training_status,
                h.training_duration
            FROM hr_activity h
            LEFT JOIN employees e ON h.employee_code = e.employee_code
            LEFT JOIN training_library t ON h.program_id = t.id
            ORDER BY h.id DESC
        """)
        rows = c.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

@router.post("/assign")
def assign_training(data: dict = Body(...)):
    # Expected: { employee_codes: ["EMP001"], program_id: 1, date: "2025-01-20", duration: "2 Hours" }
    conn = get_db_connection()
    c = conn.cursor()
    try:
        codes = data.get('employee_codes', [])
        program_id = data.get('program_id')
        date = data.get('date')
        duration = data.get('duration')
        
        # Get Program Name for backward compatibility / fallback
        c.execute("SELECT program_name FROM training_library WHERE id = ?", (program_id,))
        prog = c.fetchone()
        prog_name = prog['program_name'] if prog else "Unknown Program"
        
        for code in codes:
            c.execute("""
                INSERT INTO hr_activity (
                    employee_code, program_id, training_assigned, training_date, 
                    training_duration, training_status
                ) VALUES (?, ?, ?, ?, ?, 'Pending')
            """, (code, program_id, prog_name, date, duration))
            
        conn.commit()
        return {"success": True, "message": f"Assigned training to {len(codes)} employees."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.put("/assignment/{id}")
def update_assignment_status(id: int, data: dict = Body(...)):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("""
            UPDATE hr_activity 
            SET training_status = ? 
            WHERE id = ?
        """, (data.get('status'), id))
        conn.commit()
        return {"success": True, "message": "Updated status successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
