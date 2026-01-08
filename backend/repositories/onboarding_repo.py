from typing import Dict, Any, List, Optional
from backend.database import get_db_connection

class OnboardingRepository:
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            row = conn.execute("SELECT 1 FROM users WHERE username = ?", (email,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def get_pending_invite_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            row = conn.execute("SELECT 1 FROM onboarding_invites WHERE email = ? AND status = 'Pending'", (email,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def create_invite(self, invite_data: Dict[str, Any]) -> int:
        conn = get_db_connection()
        try:
            cursor = conn.execute('''
                INSERT INTO onboarding_invites (token, email, name, role, department, designation, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                invite_data['token'], invite_data['email'], invite_data['name'], 
                invite_data['role'], invite_data['department'], invite_data['designation'], 
                invite_data['expires_at']
            ))
            conn.commit()
            return cursor.lastrowid
        finally:
            conn.close()

    def get_all_invites(self) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            rows = conn.execute("SELECT * FROM onboarding_invites ORDER BY created_at DESC").fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def revoke_invite(self, invite_id: int):
        conn = get_db_connection()
        try:
            conn.execute("UPDATE onboarding_invites SET status = 'Revoked' WHERE id = ?", (invite_id,))
            conn.commit()
        finally:
            conn.close()
            
    def get_invite_by_token(self, token: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            row = conn.execute("SELECT * FROM onboarding_invites WHERE token = ? AND status = 'Pending'", (token,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def update_invite_status(self, token: str, status: str):
        conn = get_db_connection()
        try:
            conn.execute("UPDATE onboarding_invites SET status = ? WHERE token = ?", (status, token))
            conn.commit()
        finally:
            conn.close()

    def get_pending_approvals(self) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
             rows = conn.execute("SELECT * FROM employees WHERE employment_status = 'Pending Approval'").fetchall()
             return [dict(r) for r in rows]
        finally:
            conn.close()

    def approve_employee(self, employee_code: str, details: Dict[str, Any]):
        conn = get_db_connection()
        try:
            conn.execute('''
                UPDATE employees 
                SET employment_status = 'Active',
                    reporting_manager = ?,
                    employment_type = ?,
                    pf_included = ?,
                    mediclaim_included = ?,
                    notes = ?
                WHERE employee_code = ?
            ''', (
                details['manager'], details['type'], details['pf'], 
                details['mediclaim'], details['notes'], employee_code
            ))
            
            conn.execute("UPDATE users SET is_active = 1 WHERE employee_code = ?", (employee_code,))
            conn.commit()
        finally:
            conn.close()

    # --- Helper to create User/Employee during Onboarding Completion ---
    # This logic was heavy in router. We can delegate to EmployeeRepo/UserRepo OR keep a specific method here.
    # Since it involves a transaction across users, employees, skills, let's keep it here or use a facade.
    # I'll put the transaction logic in Service, but atomic DB calls here.
    
    def generate_employee_code(self):
        # This needs to be robust. For now mirroring old logic but wrapped.
        conn = get_db_connection()
        try:
            count = conn.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
            # Simple retry loop handled in service usually, but let's just return next ID suggestion
            return count + 1
        finally:
            conn.close()

    def check_employee_code_exists(self, code: str) -> bool:
        conn = get_db_connection()
        try:
            return conn.execute("SELECT 1 FROM employees WHERE employee_code = ?", (code,)).fetchone() is not None
        finally:
            conn.close()

    def complete_onboarding_transaction(self, user_data: dict, employee_data: dict, skill_data: dict):
        # Execute all as one transaction
        conn = get_db_connection()
        try:
            # 1. User
            conn.execute("INSERT INTO users (username, password_hash, role, employee_code, is_active) VALUES (?, ?, ?, ?, 0)", 
                    (user_data['email'], user_data['password_hash'], user_data['role'], user_data['employee_code']))
            
            # 2. Employee
            conn.execute('''
                INSERT INTO employees (
                    employee_code, name, email_id, contact_number, emergency_contact, dob, 
                    current_address, permanent_address, education_details,
                    team, designation, employment_status, doj,
                    photo_path, cv_path, id_proofs
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                employee_data['code'], employee_data['name'], employee_data['email'], 
                employee_data['phone'], employee_data['emergency'], employee_data['dob'],
                employee_data['current_address'], employee_data['permanent_address'], employee_data['education'],
                employee_data['team'], employee_data['designation'], 'Pending Approval', 
                employee_data['doj'],
                employee_data['photo_path'], employee_data['cv_path'], employee_data['id_proof_path']
            ))

            # 3. Skills
            conn.execute('''
                INSERT INTO skill_matrix (
                    employee_code, candidate_name, primary_skillset,
                    secondary_skillset, cv_upload
                ) VALUES (?, ?, ?, ?, ?)
            ''', (
                skill_data['code'], skill_data['name'], skill_data['primary'], 
                skill_data['secondary'], skill_data['cv_path']
            ))
            
            conn.commit()
        except:
            conn.rollback()
            raise
        finally:
            conn.close()
