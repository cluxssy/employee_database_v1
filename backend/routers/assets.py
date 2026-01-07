from fastapi import APIRouter, HTTPException, Body, Depends
from backend.database import get_db_connection
from backend.routers.auth import require_role
import sqlite3

router = APIRouter(
    prefix="/api/assets",
    tags=["assets"],
    dependencies=[Depends(require_role(["Admin", "HR"]))]
)

@router.get("/{employee_code}")
def get_asset_checklist(employee_code: str):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # 1. Fetch Asset Record
        c.execute("SELECT * FROM assets WHERE employee_code = ?", (employee_code,))
        asset_row = c.fetchone()
        
        # 2. Fetch Employee Record (for fallback/sync)
        c.execute("SELECT pf_included, mediclaim_included FROM employees WHERE employee_code = ?", (employee_code,))
        emp_row = c.fetchone()
        
        result = {}
        
        if asset_row:
            result = dict(asset_row)
            
            # Optional: If values are 0 in assets but 'Yes' in employees, we could sync them here?
            # For now, let's trust the assets table if it exists, assuming it's the source of truth for the checklist.
            # However, if it was just created empty, we might want to fill gaps.
            pass
        else:
            # Asset row doesn't exist yet, create default state based on Employee table
            ob_pf = 0
            ob_mediclaim = 0
            
            if emp_row:
                pf = emp_row['pf_included']
                med = emp_row['mediclaim_included']
                
                if pf and str(pf).lower() in ['yes', 'true', '1', 'on']:
                    ob_pf = 1
                
                if med and str(med).lower() in ['yes', 'true', '1', 'on']:
                    ob_mediclaim = 1
            
            result = {
                "employee_code": employee_code,
                "ob_pf": ob_pf,
                "ob_mediclaim": ob_mediclaim
            }
            
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.post("/{employee_code}")
def upsert_asset_checklist(employee_code: str, data: dict = Body(...)):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Check if exists
        c.execute("SELECT 1 FROM assets WHERE employee_code = ?", (employee_code,))
        exists = c.fetchone()

        if exists:
            # Update
            c.execute('''
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
        else:
            # Insert
            c.execute('''
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
                
                data.get('cl_remarks', '')
            ))
            
        conn.commit()
        return {"success": True, "message": "Checklist updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

