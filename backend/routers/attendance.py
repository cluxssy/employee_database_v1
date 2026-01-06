from fastapi import APIRouter, HTTPException, Depends, Request, Form
from typing import List, Optional
import sqlite3
from datetime import datetime
from pydantic import BaseModel
from backend.database import get_db_connection
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

# --- Models ---
class ClockOutRequest(BaseModel):
    work_log: str

class LeaveRequest(BaseModel):
    start_date: str
    end_date: str
    leave_type: str
    reason: str

# --- Attendance Enpoints ---

@router.get("/status")
def get_attendance_status(user=Depends(get_current_user)):
    """Check if the user is currently clocked in for today."""
    conn = get_db_connection()
    today = datetime.now().strftime('%Y-%m-%d')
    try:
        record = conn.execute(
            "SELECT * FROM attendance WHERE employee_code = ? AND date = ?", 
            (user['employee_code'], today)
        ).fetchone()
        
        if not record:
            return {"status": "not_started", "data": None}
        
        data = dict(record)
        if data['clock_out']:
             return {"status": "completed", "data": data}
        else:
             return {"status": "clocked_in", "data": data}
    finally:
        conn.close()

@router.post("/clock-in")
def clock_in(request: Request, user=Depends(get_current_user)):
    conn = get_db_connection()
    c = conn.cursor()
    today = datetime.now().strftime('%Y-%m-%d')
    now = datetime.now().strftime('%H:%M:%S')
    ip = request.client.host
    
    try:
        # Check if already clocked in
        existing = c.execute(
            "SELECT 1 FROM attendance WHERE employee_code = ? AND date = ?", 
            (user['employee_code'], today)
        ).fetchone()
        
        if existing:
            raise HTTPException(status_code=400, detail="Already clocked in for today")
            
        c.execute('''
            INSERT INTO attendance (employee_code, date, clock_in, ip_address, status)
            VALUES (?, ?, ?, ?, 'Present')
        ''', (user['employee_code'], today, now, ip))
        
        conn.commit()
        return {"success": True, "message": "Clocked in successfully", "time": now}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.post("/clock-out")
def clock_out(data: ClockOutRequest, user=Depends(get_current_user)):
    conn = get_db_connection()
    c = conn.cursor()
    today = datetime.now().strftime('%Y-%m-%d')
    now = datetime.now().strftime('%H:%M:%S')
    
    try:
        # Check if actually clocked in
        record = c.execute(
            "SELECT * FROM attendance WHERE employee_code = ? AND date = ?", 
            (user['employee_code'], today)
        ).fetchone()
        
        if not record:
             raise HTTPException(status_code=400, detail="No attendance record found for today. Please clock in first.")
        
        if record['clock_out']:
             raise HTTPException(status_code=400, detail="Already clocked out.")

        c.execute('''
            UPDATE attendance 
            SET clock_out = ?, work_log = ?
            WHERE employee_code = ? AND date = ?
        ''', (now, data.work_log, user['employee_code'], today))
        
        conn.commit()
        return {"success": True, "message": "Clocked out successfully"}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.get("/history")
def get_attendance_history(user=Depends(get_current_user)):
    """Get last 30 days of attendance."""
    conn = get_db_connection()
    try:
        records = conn.execute('''
            SELECT * FROM attendance 
            WHERE employee_code = ? 
            ORDER BY date DESC LIMIT 30
        ''', (user['employee_code'],)).fetchall()
        return [dict(r) for r in records]
    finally:
        conn.close()

# --- Leave Management Endpoints ---

@router.get("/leave/balance")
def get_leave_balance(user=Depends(get_current_user)):
    conn = get_db_connection()
    try:
        # Ensure a balance record exists
        balance = conn.execute(
            "SELECT * FROM leave_balances WHERE employee_code = ? AND year = ?",
            (user['employee_code'], datetime.now().year)
        ).fetchone()
        
        if not balance:
            # Create default if missing
            conn.execute(
                "INSERT INTO leave_balances (employee_code, year) VALUES (?, ?)",
                (user['employee_code'], datetime.now().year)
            )
            conn.commit()
            balance = conn.execute(
                "SELECT * FROM leave_balances WHERE employee_code = ? AND year = ?",
                (user['employee_code'], datetime.now().year)
            ).fetchone()
            
        return dict(balance)
    finally:
        conn.close()

@router.post("/leave/apply")
def apply_leave(req: LeaveRequest, user=Depends(get_current_user)):
    conn = get_db_connection()
    try:
        # Check sufficient balance (simplified check)
        balance = conn.execute(
            "SELECT * FROM leave_balances WHERE employee_code = ? AND year = ?", 
            (user['employee_code'], datetime.now().year)
        ).fetchone()

        if not balance:
             raise HTTPException(status_code=400, detail="Leave balance not found")

        # Basic balance Validation 
        # (This is rough as we just check if used < total, but doesn't account for duration of this request)
        if req.leave_type.lower() == 'sick':
            if balance['sick_used'] >= balance['sick_total']:
                raise HTTPException(status_code=400, detail="Insufficient Sick Leave balance")
        elif req.leave_type.lower() == 'casual':
             if balance['casual_used'] >= balance['casual_total']:
                raise HTTPException(status_code=400, detail="Insufficient Casual Leave balance")

        conn.execute('''
            INSERT INTO leaves (employee_code, start_date, end_date, leave_type, reason, status)
            VALUES (?, ?, ?, ?, ?, 'Pending')
        ''', (user['employee_code'], req.start_date, req.end_date, req.leave_type, req.reason))
        
        conn.commit()
        return {"success": True, "message": "Leave application submitted successfully"}
    finally:
        conn.close()

@router.get("/leave/my-requests")
def get_my_leaves(user=Depends(get_current_user)):
    conn = get_db_connection()
    try:
        leaves = conn.execute(
            "SELECT * FROM leaves WHERE employee_code = ? ORDER BY applied_at DESC", 
            (user['employee_code'],)
        ).fetchall()
        return [dict(l) for l in leaves]
    finally:
        conn.close()

# --- Admin/HR Endpoints ---

@router.get("/leave/all-requests")
def get_all_leave_requests(user=Depends(get_current_user)):
    if user['role'] not in ['Admin', 'HR', 'Management']:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    conn = get_db_connection()
    try:
        leaves = conn.execute('''
            SELECT l.*, e.name as employee_name 
            FROM leaves l 
            JOIN employees e ON l.employee_code = e.employee_code 
            WHERE l.status = 'Pending'
            ORDER BY l.applied_at ASC
        ''').fetchall()
        return [dict(l) for l in leaves]
    finally:
        conn.close()

@router.get("/admin/today")
def get_daily_attendance_log(date: Optional[str] = None, user=Depends(get_current_user)):
    if user['role'] not in ['Admin', 'HR', 'Management']:
         raise HTTPException(status_code=403, detail="Not authorized")
    
    target_date = date or datetime.now().strftime('%Y-%m-%d')
    conn = get_db_connection()
    try:
        logs = conn.execute('''
            SELECT a.*, e.name as employee_name, e.designation 
            FROM attendance a
            JOIN employees e ON a.employee_code = e.employee_code 
            WHERE a.date = ?
        ''', (target_date,)).fetchall()
        return [dict(l) for l in logs]
    finally:
        conn.close()

@router.post("/leave/action/{leave_id}")
def approve_reject_leave(leave_id: int, action: str = Form(...), reason: str = Form(None), user=Depends(get_current_user)):

    if user['role'] not in ['Admin', 'HR', 'Management']:
         raise HTTPException(status_code=403, detail="Not authorized")

    if action not in ['Approved', 'Rejected']:
         raise HTTPException(status_code=400, detail="Invalid action")

    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("SELECT * FROM leaves WHERE id = ?", (leave_id,))
        leave = c.fetchone()

        if not leave:
            raise HTTPException(status_code=404, detail="Leave request not found")

        # 1. Prevent Self-Approval
        if user.get('employee_code') and leave['employee_code'] == user['employee_code']:
            raise HTTPException(status_code=403, detail="You cannot approve your own leave request.")

        # 2. Hierarchy Check (HR leaves must be approved by Admin)
        # Fetch applicant's system role
        applicant = c.execute("SELECT role FROM users WHERE employee_code = ?", (leave['employee_code'],)).fetchone()
        if applicant:
            if applicant['role'] == 'HR' and user['role'] != 'Admin':
                raise HTTPException(status_code=403, detail="HR leave requests can only be approved by an Administrator.")

        c.execute("UPDATE leaves SET status = ?, rejection_reason = ? WHERE id = ?", (action, reason, leave_id))
        
        # If approved, update balance (Assuming 1 day deduction for simplicity, real app needs duration calc)
        # TODO: Calculate days between start and end date
        if action == 'Approved':
            # Simplified: Assuming 1 day. 
            # In production, we'd parse dates: end - start + 1
            days = 1 
            try:
                d1 = datetime.strptime(leave['start_date'], '%Y-%m-%d')
                d2 = datetime.strptime(leave['end_date'], '%Y-%m-%d')
                days = (d2 - d1).days + 1
            except:
                pass

            col_map = {'Sick': 'sick_used', 'Casual': 'casual_used', 'Privilege': 'privilege_used'}
            col = col_map.get(leave['leave_type'])
            
            if col:
                c.execute(f"UPDATE leave_balances SET {col} = {col} + ? WHERE employee_code = ?", (days, leave['employee_code']))

        conn.commit()
        return {"success": True, "message": f"Leave has been {action}"}
    finally:
        conn.close()
