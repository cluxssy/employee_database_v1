from typing import Dict, Any, Optional
from backend.database import get_db_connection

class AssetRepository:
    def get_asset_checklist(self, employee_code: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
             row = conn.execute("SELECT * FROM assets WHERE employee_code = ?", (employee_code,)).fetchone()
             return dict(row) if row else None
        finally:
            conn.close()

    def get_employee_defaults(self, employee_code: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            row = conn.execute("SELECT pf_included, mediclaim_included FROM employees WHERE employee_code = ?", (employee_code,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def check_exists(self, employee_code: str) -> bool:
        conn = get_db_connection()
        try:
            return conn.execute("SELECT 1 FROM assets WHERE employee_code = ?", (employee_code,)).fetchone() is not None
        finally:
            conn.close()

    def update_asset_checklist(self, employee_code: str, data: Dict[str, Any]):
        conn = get_db_connection()
        try:
            conn.execute('''
                UPDATE assets SET 
                    ob_laptop=?, ob_laptop_bag=?, ob_headphones=?, ob_mouse=?, 
                    ob_extra_hardware=?, ob_client_assets=?, 
                    ob_id_card=?, ob_email_access=?, ob_groups=?, ob_mediclaim=?, ob_pf=?,
                    ob_remarks=?,

                    cl_laptop=?, cl_laptop_bag=?, cl_headphones=?, cl_mouse=?, 
                    cl_extra_hardware=?, cl_client_assets=?, 
                    cl_id_card=?, cl_email_access=?, cl_groups=?, cl_relieving_letter=?,
                    cl_remarks=?,
                    
                    updated_at=CURRENT_TIMESTAMP
                WHERE employee_code = ?
            ''', (
                # Onboarding
                data.get('ob_laptop', 0), data.get('ob_laptop_bag', 0), 
                data.get('ob_headphones', 0), data.get('ob_mouse', 0),
                data.get('ob_extra_hardware', 0), data.get('ob_client_assets', 0), 
                
                data.get('ob_id_card', 0), data.get('ob_email_access', 0),
                data.get('ob_groups', 0), data.get('ob_mediclaim', 0), data.get('ob_pf', 0),
                
                data.get('ob_remarks', ''),
                
                # Clearance
                data.get('cl_laptop', 0), data.get('cl_laptop_bag', 0), 
                data.get('cl_headphones', 0), data.get('cl_mouse', 0),
                data.get('cl_extra_hardware', 0), data.get('cl_client_assets', 0), 
                
                data.get('cl_id_card', 0), data.get('cl_email_access', 0),
                data.get('cl_groups', 0), data.get('cl_relieving_letter', 0),
                
                data.get('cl_remarks', ''),
                
                employee_code
            ))
            conn.commit()
        finally:
            conn.close()

    def create_asset_checklist(self, employee_code: str, data: Dict[str, Any]):
        conn = get_db_connection()
        try:
            conn.execute('''
                INSERT INTO assets (
                    employee_code, 
                    ob_laptop, ob_laptop_bag, ob_headphones, ob_mouse, 
                    ob_extra_hardware, ob_client_assets, 
                    ob_id_card, ob_email_access, ob_groups, ob_mediclaim, ob_pf,
                    ob_remarks,

                    cl_laptop, cl_laptop_bag, cl_headphones, cl_mouse, 
                    cl_extra_hardware, cl_client_assets, 
                    cl_id_card, cl_email_access, cl_groups, cl_relieving_letter,
                    cl_remarks
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                employee_code,
                data.get('ob_laptop', 0), data.get('ob_laptop_bag', 0), 
                data.get('ob_headphones', 0), data.get('ob_mouse', 0),
                data.get('ob_extra_hardware', 0), data.get('ob_client_assets', 0), 
                
                data.get('ob_id_card', 0), data.get('ob_email_access', 0),
                data.get('ob_groups', 0), data.get('ob_mediclaim', 0), data.get('ob_pf', 0),
                
                data.get('ob_remarks', ''),
                
                data.get('cl_laptop', 0), data.get('cl_laptop_bag', 0), 
                data.get('cl_headphones', 0), data.get('cl_mouse', 0),
                data.get('cl_extra_hardware', 0), data.get('cl_client_assets', 0), 
                
                data.get('cl_id_card', 0), data.get('cl_email_access', 0),
                data.get('cl_groups', 0), data.get('cl_relieving_letter', 0),
                
                data.get('cl_remarks', '')
            ))
            conn.commit()
        finally:
            conn.close()
