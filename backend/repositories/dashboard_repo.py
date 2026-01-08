import sqlite3
import pandas as pd
from typing import Dict, Any, List, Optional
from backend.database import get_db_connection

class DashboardRepository:
    def get_all_counts(self) -> Dict[str, Any]:
        """Fetch raw dataframes for analytics. Returning DF might be heavy but it's what existing logic uses."""
        conn = get_db_connection()
        try:
            return {
                "employees": pd.read_sql("SELECT * FROM employees", conn),
                "assets": pd.read_sql("SELECT * FROM assets", conn),
                "skills": pd.read_sql("SELECT * FROM skill_matrix", conn),
            }
        finally:
            conn.close()

    def get_employee_dashboard_data(self, employee_code: str) -> Dict[str, Any]:
        conn = get_db_connection()
        try:
            result = {}
            # 1. Employee Details
            c = conn.cursor()
            c.execute("SELECT * FROM employees WHERE employee_code = ?", (employee_code,))
            emp = c.fetchone()
            result['employee'] = dict(emp) if emp else {}

            # 2. Performance (KRAs)
            result['kras'] = dict(conn.execute("""
                SELECT count(*) as total, 
                       sum(case when status = 'Completed' then 1 else 0 end) as completed
                FROM kra_assignments 
                WHERE employee_code = ?
            """, (employee_code,)).fetchone())
            
            # 3. Training (HR Activity)
            result['training'] = dict(conn.execute("""
                SELECT count(*) as total,
                       sum(case when training_status = 'Completed' then 1 else 0 end) as completed
                FROM hr_activity
                WHERE employee_code = ?
            """, (employee_code,)).fetchone())
            
            # 4. Assets
            asset_row = conn.execute("""
                SELECT 
                    ob_laptop + ob_laptop_bag + ob_headphones + ob_mouse + ob_extra_hardware + ob_client_assets as total_assigned
                FROM assets 
                WHERE employee_code = ?
            """, (employee_code,)).fetchone()
            result['asset_count'] = asset_row['total_assigned'] if asset_row and asset_row['total_assigned'] else 0
            
            # 5. Notifications
            notifs = conn.execute("""
                SELECT * FROM notifications 
                WHERE employee_code = ? 
                ORDER BY created_at DESC 
                LIMIT 5
            """, (employee_code,)).fetchall()
            result['notifications'] = [dict(n) for n in notifs]
            
            # 6. Attendance Today
            att = conn.execute("SELECT 1 FROM attendance WHERE employee_code = ? AND date = date('now')", (employee_code,)).fetchone()
            result['attendance_status'] = "Present" if att else "Absent"
            
            # 7. Leaves
            balance = conn.execute("SELECT sick_used, sick_total, casual_used, casual_total FROM leave_balances WHERE employee_code = ? AND year = strftime('%Y', 'now')", (employee_code,)).fetchone()
            result['leaves'] = dict(balance) if balance else {"sick_used": 0, "sick_total": 0, "casual_used": 0, "casual_total": 0}
            
            return result
        finally:
            conn.close()
