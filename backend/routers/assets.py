from fastapi import APIRouter, HTTPException, Body, Depends
from backend.database import get_db_connection
from backend.routers.auth import require_role
import sqlite3

router = APIRouter(
    prefix="/api/assets",
    tags=["assets"],
    dependencies=[Depends(require_role(["Admin", "HR"]))]
)

@router.post("/")
def add_asset(data: dict = Body(...)):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO assets (
                employee_code, asset_id, issued_to, issue_date, 
                laptop_returned
            ) VALUES (?, ?, ?, ?, 0)
        ''', (
            data.get('employee_code'),
            data.get('asset_id'),
            data.get('issued_to'), # Employee Name
            data.get('issue_date')
        ))
        conn.commit()
        return {"success": True, "message": "Asset assigned successfully"}
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.put("/{asset_id}")
def update_asset(asset_id: int, data: dict = Body(...)): # ID is primary key
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Update return details and checklist
        c.execute('''
            UPDATE assets SET 
                return_date = ?,
                laptop_returned = ?
            WHERE id = ?
        ''', (
            data.get('return_date'),
            data.get('laptop_returned'),
            asset_id
        ))
        conn.commit()
        return {"success": True, "message": "Asset updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@router.delete("/{asset_id}")
def delete_asset(asset_id: int):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("DELETE FROM assets WHERE id = ?", (asset_id,))
        conn.commit()
        return {"success": True, "message": "Asset deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
