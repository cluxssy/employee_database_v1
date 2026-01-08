import sqlite3
from typing import List, Optional, Dict, Any
from backend.database import get_db_connection

class AttendanceRepository:
    def get_todays_attendance(self, employee_code: str, date: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            row = conn.execute(
                "SELECT * FROM attendance WHERE employee_code = ? AND date = ?", 
                (employee_code, date)
            ).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def clock_in(self, employee_code: str, date: str, time: str, ip: str):
        conn = get_db_connection()
        try:
            conn.execute('''
                INSERT INTO attendance (employee_code, date, clock_in, ip_address, status)
                VALUES (?, ?, ?, ?, 'Present')
            ''', (employee_code, date, time, ip))
            conn.commit()
        finally:
            conn.close()

    def clock_out(self, employee_code: str, date: str, time: str, work_log: str):
        conn = get_db_connection()
        try:
            conn.execute('''
                UPDATE attendance 
                SET clock_out = ?, work_log = ?
                WHERE employee_code = ? AND date = ?
            ''', (time, work_log, employee_code, date))
            conn.commit()
        finally:
            conn.close()

    def get_history(self, employee_code: str, limit: int = 30) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            records = conn.execute(f'''
                SELECT * FROM attendance 
                WHERE employee_code = ? 
                ORDER BY date DESC LIMIT {limit}
            ''', (employee_code,)).fetchall()
            return [dict(r) for r in records]
        finally:
            conn.close()

    def get_leave_balance(self, employee_code: str, year: int) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            row = conn.execute(
                "SELECT * FROM leave_balances WHERE employee_code = ? AND year = ?",
                (employee_code, year)
            ).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def create_leave_balance(self, employee_code: str, year: int):
        conn = get_db_connection()
        try:
            conn.execute(
                "INSERT INTO leave_balances (employee_code, year) VALUES (?, ?)",
                (employee_code, year)
            )
            conn.commit()
        finally:
            conn.close()
    
    def update_leave_balance(self, employee_code: str, column: str, days: int):
        conn = get_db_connection()
        try:
            conn.execute(f"UPDATE leave_balances SET {column} = {column} + ? WHERE employee_code = ?", (days, employee_code))
            conn.commit()
        finally:
            conn.close()

    def create_leave_request(self, employee_code: str, start: str, end: str, l_type: str, reason: str):
        conn = get_db_connection()
        try:
            conn.execute('''
                INSERT INTO leaves (employee_code, start_date, end_date, leave_type, reason, status)
                VALUES (?, ?, ?, ?, ?, 'Pending')
            ''', (employee_code, start, end, l_type, reason))
            conn.commit()
        finally:
            conn.close()

    def get_employee_leaves(self, employee_code: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            leaves = conn.execute(
                "SELECT * FROM leaves WHERE employee_code = ? ORDER BY applied_at DESC", 
                (employee_code,)
            ).fetchall()
            return [dict(l) for l in leaves]
        finally:
            conn.close()

    def get_all_pending_leaves(self) -> List[Dict[str, Any]]:
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
            
    def get_leave_by_id(self, leave_id: int) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            row = conn.execute("SELECT * FROM leaves WHERE id = ?", (leave_id,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def update_leave_status(self, leave_id: int, status: str, reason: Optional[str]):
        conn = get_db_connection()
        try:
            conn.execute("UPDATE leaves SET status = ?, rejection_reason = ? WHERE id = ?", (status, reason, leave_id))
            conn.commit()
        finally:
            conn.close()

    def get_daily_log(self, date: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            logs = conn.execute('''
                SELECT a.*, e.name as employee_name, e.designation 
                FROM attendance a
                JOIN employees e ON a.employee_code = e.employee_code 
                WHERE a.date = ?
            ''', (date,)).fetchall()
            return [dict(l) for l in logs]
        finally:
            conn.close()

    def get_monthly_attendance(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
             rows = conn.execute("""
                SELECT employee_code, date, status 
                FROM attendance 
                WHERE date BETWEEN ? AND ?
            """, (start_date, end_date)).fetchall()
             return [dict(r) for r in rows]
        finally:
            conn.close()

    def get_monthly_approved_leaves(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            rows = conn.execute("""
                SELECT employee_code, start_date, end_date, leave_type
                FROM leaves 
                WHERE status = 'Approved' 
                AND (
                    (start_date BETWEEN ? AND ?) OR 
                    (end_date BETWEEN ? AND ?)
                )
            """, (start_date, end_date, start_date, end_date)).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()
            
    def get_all_active_employees_basic(self) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            rows = conn.execute("SELECT name, employee_code FROM employees WHERE employment_status = 'Active' ORDER BY name").fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def get_user_role(self, employee_code: str) -> Optional[str]:
        conn = get_db_connection()
        try:
            row = conn.execute("SELECT role FROM users WHERE employee_code = ?", (employee_code,)).fetchone()
            return row['role'] if row else None
        finally:
             conn.close()
