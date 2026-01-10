import sqlite3
from typing import List, Dict, Any, Optional
from backend.database import get_db_connection

class EmployeeRepository:
    def get_all_employees_basic(self) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            rows = conn.execute("""
                SELECT e.employee_code, e.name, e.designation, e.team, e.reporting_manager, e.email_id, e.photo_path, e.employment_status, e.exit_date, u.role
                FROM employees e
                LEFT JOIN users u ON e.employee_code = u.employee_code
            """).fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    def get_employee_by_code(self, employee_code: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            row = conn.execute("SELECT * FROM employees WHERE employee_code = ?", (employee_code,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def get_skill_matrix(self, employee_code: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
             row = conn.execute("SELECT * FROM skill_matrix WHERE employee_code = ?", (employee_code,)).fetchone()
             return dict(row) if row else {}
        finally:
            conn.close()

    def get_assets(self, employee_code: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            rows = conn.execute("SELECT * FROM assets WHERE employee_code = ?", (employee_code,)).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def get_performance(self, employee_code: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            rows = conn.execute("SELECT * FROM performance WHERE employee_code = ?", (employee_code,)).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def get_hr_activity(self, employee_code: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            rows = conn.execute("SELECT * FROM hr_activity WHERE employee_code = ?", (employee_code,)).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def get_kra_assignments(self, employee_code: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            rows = conn.execute("""
                SELECT 
                    ka.id as assignment_id,
                    ka.kra_id,
                    ka.period,
                    ka.status,
                    ka.self_rating,
                    ka.manager_rating,
                    ka.final_score,
                    ka.self_comment,
                    ka.manager_comment,
                    ka.assigned_at,
                    kl.name as kra_name,
                    kl.goal_name,
                    kl.description,
                    kl.weightage
                FROM kra_assignments ka
                JOIN kra_library kl ON ka.kra_id = kl.id
                WHERE ka.employee_code = ?
                ORDER BY ka.assigned_at DESC
            """, (employee_code,)).fetchall()
            return [dict(r) for r in rows]
        except Exception:
            return []
        finally:
            conn.close()

    def create_employee(self, data: Dict[str, Any]):
        conn = get_db_connection()
        try:
            conn.execute('''
                INSERT INTO employees (
                    employee_code, name, dob, contact_number, emergency_contact, email_id, doj, 
                    team, designation, employment_type, reporting_manager, location, 
                    current_address, permanent_address,
                    pf_included, mediclaim_included, 
                    photo_path, cv_path, id_proofs, notes, 
                    employment_status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
            ''', (
                data['code'], data['name'], data['dob'], data['phone'], data['emergency'], 
                data['email'], data['doj'], data['team'], data['role'], data['type'], 
                data['manager'], data['location'], data['current_address'], data['permanent_address'],
                data['pf'], data['mediclaim'], 
                data['photo_path'], data['cv_path'], data['id_proofs'], data['notes']
            ))
            
            # Skill Matrix
            conn.execute('''
                INSERT INTO skill_matrix (
                    employee_code, candidate_name, primary_skillset,
                    secondary_skillset, experience_years, cv_upload
                ) VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                data['code'], data['name'], data['primary_skillset'], data['secondary_skillset'],
                data['experience_years'], data['cv_path']
            ))
            
            # Assets Init
            ob_pf_val = 1 if data.get('pf') and str(data['pf']).lower() in ['yes', 'true', '1', 'on'] else 0
            ob_med_val = 1 if data.get('mediclaim') and str(data['mediclaim']).lower() in ['yes', 'true', '1', 'on'] else 0
            
            conn.execute('''
                INSERT INTO assets (
                    employee_code, ob_pf, ob_mediclaim
                ) VALUES (?, ?, ?)
            ''', (data['code'], ob_pf_val, ob_med_val))
            
            conn.commit()
        finally:
            conn.close()

    def update_employee_fields(self, employee_code: str, fields: List[str], values: List[Any]):
        conn = get_db_connection()
        try:
            values.append(employee_code)
            query = f"UPDATE employees SET {', '.join(fields)} WHERE employee_code = ?"
            conn.execute(query, tuple(values))
            conn.commit()
        finally:
            conn.close()

    def update_skill_matrix(self, employee_code: str, primary: str, secondary: str):
        conn = get_db_connection()
        try:
            # Check exist
            exists = conn.execute("SELECT id FROM skill_matrix WHERE employee_code = ?", (employee_code,)).fetchone()
            if exists:
                updates = []
                vals = []
                if primary is not None:
                    updates.append("primary_skillset = ?")
                    vals.append(primary)
                if secondary is not None:
                    updates.append("secondary_skillset = ?")
                    vals.append(secondary)
                
                if updates:
                    vals.append(employee_code)
                    conn.execute(f"UPDATE skill_matrix SET {', '.join(updates)} WHERE employee_code = ?", tuple(vals))
            else:
                conn.execute("INSERT INTO skill_matrix (employee_code, primary_skillset, secondary_skillset) VALUES (?, ?, ?)", 
                          (employee_code, primary or '', secondary or ''))
            conn.commit()
        finally:
            conn.close()

    def delete_employee_cascade(self, employee_code: str):
        conn = get_db_connection()
        try:
            conn.execute("DELETE FROM skill_matrix WHERE employee_code = ?", (employee_code,))
            conn.execute("DELETE FROM assets WHERE employee_code = ?", (employee_code,))
            conn.execute("DELETE FROM performance WHERE employee_code = ?", (employee_code,))
            conn.execute("DELETE FROM hr_activity WHERE employee_code = ?", (employee_code,))
            conn.execute("DELETE FROM employees WHERE employee_code = ?", (employee_code,))
            conn.commit()
        finally:
            conn.close()

    def get_dropdown_options(self) -> Dict[str, Any]:
        conn = get_db_connection()
        try:
            teams = [r[0] for r in conn.execute("SELECT DISTINCT team FROM employees WHERE team IS NOT NULL AND team != '' ORDER BY team").fetchall()]
            designations = [r[0] for r in conn.execute("SELECT DISTINCT designation FROM employees WHERE designation IS NOT NULL AND designation != '' ORDER BY designation").fetchall()]
            
            managers = [{"name": r[0], "code": r[1], "role": r[2]} for r in conn.execute("""
                SELECT e.name, u.employee_code, u.role
                FROM employees e
                JOIN users u ON e.employee_code = u.employee_code
                WHERE u.role IN ('Management', 'Admin', 'HR')
                ORDER BY e.name
            """).fetchall()]
            
            return {"teams": teams, "designations": designations, "managers": managers}
        finally:
             conn.close()

    def offboard_employee(self, employee_code: str, exit_date: str, exit_reason: str):
        conn = get_db_connection()
        try:
            conn.execute("""
                UPDATE employees 
                SET employment_status = 'Exited', 
                    exit_date = ?, 
                    exit_reason = ?,
                    clearance_status = 'Pending'
                WHERE employee_code = ?
            """, (exit_date, exit_reason, employee_code))
            
            conn.execute("UPDATE users SET is_active = 0 WHERE employee_code = ?", (employee_code,))
            conn.commit()
        finally:
            conn.close()
