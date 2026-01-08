from datetime import datetime
import os
import shutil
from typing import Optional, Dict, Any, List
from backend.repositories.employee_repo import EmployeeRepository
from backend.schemas.employee import UpdateEmployeeRequest, OffboardRequest

class EmployeeService:
    def __init__(self):
        self.repo = EmployeeRepository()

    def get_all_employees(self):
        return self.repo.get_all_employees_basic()

    def get_employee_full_details(self, employee_code: str):
        employee = self.repo.get_employee_by_code(employee_code)
        if not employee:
            return None
            
        # Enrich with other data
        employee['skill_matrix'] = self.repo.get_skill_matrix(employee_code)
        employee['assets'] = self.repo.get_assets(employee_code)
        employee['performance'] = self.repo.get_performance(employee_code)
        employee['hr_activity'] = self.repo.get_hr_activity(employee_code)
        employee['kra_assignments'] = self.repo.get_kra_assignments(employee_code)
        
        return employee

    def create_employee(self, data: Dict[str, Any]):
        # Validations
        if not data['code'].startswith("EMP"):
             raise ValueError("Employee code must start with 'EMP'.")
        
        if not data['phone'].isdigit() or len(data['phone']) != 10:
             raise ValueError("Contact number must be exactly 10 digits.")

        # Date calcs for age validation
        try:
            dob_date = datetime.strptime(data['dob'], "%Y-%m-%d")
            doj_date = datetime.strptime(data['doj'], "%Y-%m-%d")
            today = datetime.today()
            age = today.year - dob_date.year - ((today.month, today.day) < (dob_date.month, dob_date.day))
            if age < 18:
                raise ValueError("Employee must be at least 18 years old.")
        except ValueError:
             raise ValueError("Invalid date format.")

        # Ensure unique code check happens at DB level (repo handles IntegrityError mainly)
        # But we can check existence first if we want specific error
        if self.repo.get_employee_by_code(data['code']):
            raise ValueError("Employee Code already exists.")

        self.repo.create_employee(data)
        return {"success": True, "message": "Employee added successfully!"}

    def update_employee(self, employee_code: str, data: dict):
        allowed_fields = [
            'exit_date', 'exit_reason', 'clearance_status', 'employment_status',
            'name', 'designation', 'team',
            'contact_number', 'emergency_contact', 'current_address', 
            'permanent_address', 'dob', 'email_id', 'reporting_manager', 'location'
        ]
        
        fields = []
        values = []
        
        for key, value in data.items():
            if key in allowed_fields and value is not None:
                fields.append(f"{key} = ?")
                values.append(value)
        
        if fields:
            self.repo.update_employee_fields(employee_code, fields, values)

        # Skills update
        p_skill = data.get('primary_skillset')
        s_skill = data.get('secondary_skillset')
        
        if 'skill_matrix' in data and isinstance(data['skill_matrix'], dict):
             p_skill = data['skill_matrix'].get('primary_skillset', p_skill)
             s_skill = data['skill_matrix'].get('secondary_skillset', s_skill)
             
        if p_skill is not None or s_skill is not None:
            self.repo.update_skill_matrix(employee_code, p_skill, s_skill)

        return {"success": True, "message": "Employee updated successfully"}
    
    def delete_employee(self, employee_code: str):
        if not self.repo.get_employee_by_code(employee_code):
             raise ValueError("Employee not found")
        
        self.repo.delete_employee_cascade(employee_code)
        return {"success": True, "message": f"Employee {employee_code} deleted successfully"}

    def get_options(self):
        return self.repo.get_dropdown_options()

    def offboard_employee(self, employee_code: str, req: OffboardRequest):
         exit_date = req.exit_date or datetime.today().strftime('%Y-%m-%d')
         exit_reason = req.exit_reason or 'Resignation'
         self.repo.offboard_employee(employee_code, exit_date, exit_reason)
         return {"success": True, "message": f"Employee {employee_code} successfully offboarded."}
