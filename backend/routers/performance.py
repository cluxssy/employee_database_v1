from fastapi import APIRouter, HTTPException, Body, Depends
from backend.database import get_db_connection
from backend.routers.auth import require_role
import sqlite3

router = APIRouter(
    prefix="/api/performance",
    tags=["performance"],
    dependencies=[Depends(require_role(["Admin", "HR"]))]
)

# --- 1. KRA Library Management ---

@router.get("/kras")
def get_all_kras():
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("SELECT * FROM kra_library ORDER BY created_at DESC")
        rows = c.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

@router.post("/kras")
def create_kra(data: dict = Body(...)):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("""
            INSERT INTO kra_library (name, goal_name, description, weightage)
            VALUES (?, ?, ?, ?)
        """, (data.get('name'), data.get('goal_name'), data.get('description'), data.get('weightage', 0)))
        conn.commit()
        return {"success": True, "message": "KRA created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# --- 2. Custom Group Management ---

@router.get("/groups")
def get_groups():
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Get Groups
        c.execute("SELECT * FROM employee_groups")
        groups = [dict(row) for row in rows] if (rows := c.fetchall()) else []
        
        # Attach Member Counts (Optional for UI)
        for g in groups:
            c.execute("SELECT COUNT(*) as count FROM employee_group_members WHERE group_id = ?", (g['id'],))
            g['member_count'] = c.fetchone()['count']
            
        return groups
    finally:
        conn.close()

@router.post("/groups")
def create_group(data: dict = Body(...)):
    # Expected: { group_name: "Interns", employee_codes: ["EMP001", "EMP002"] }
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Create Group
        c.execute("INSERT INTO employee_groups (group_name, description) VALUES (?, ?)", 
                  (data.get('group_name'), data.get('description', '')))
        group_id = c.lastrowid
        
        # Add Members
        codes = data.get('employee_codes', [])
        for code in codes:
            c.execute("INSERT INTO employee_group_members (group_id, employee_code) VALUES (?, ?)", (group_id, code))
            
        conn.commit()
        return {"success": True, "message": "Group created successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Group name already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# --- 3. Dynamic Teams (Helper) ---
@router.get("/teams")
def get_existing_teams():
    # Returns list of unique teams found in employees table
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute("SELECT DISTINCT team FROM employees WHERE team IS NOT NULL and team != ''")
        return [row['team'] for row in c.fetchall()]
    finally:
        conn.close()


# --- 4. Assignment Logic (The "Bulk Assign" Feature) ---
@router.post("/assign")
def assign_kra(data: dict = Body(...)):
    # Expected: 
    # { 
    #   kra_ids: [1, 2], 
    #   target_type: "individual" | "group" | "team", 
    #   target_value: "EMP001" | group_id | "IT Dept",
    #   period: "Q4 2024" 
    # }
    
    conn = get_db_connection()
    c = conn.cursor()
    try:
        kra_ids = data.get('kra_ids', [])
        target_type = data.get('target_type')
        target_value = data.get('target_value')
        period = data.get('period', 'Current')
        
        employees_to_assign = []
        
        # Resolve Target to List of Employees
        if target_type == 'individual':
            employees_to_assign = [target_value]
            
        elif target_type == 'team':
            c.execute("SELECT employee_code FROM employees WHERE team = ?", (target_value,))
            employees_to_assign = [row['employee_code'] for row in c.fetchall()]
            
        elif target_type == 'group':
            c.execute("SELECT employee_code FROM employee_group_members WHERE group_id = ?", (target_value,))
            employees_to_assign = [row['employee_code'] for row in c.fetchall()]
        
        # Perform Assignments
        count = 0
        for code in employees_to_assign:
            for kra_id in kra_ids:
                # Check for duplicate assignment in same period?
                # For now, we trust the user or simple ignore insert error if we add constraint later
                c.execute("""
                    INSERT INTO kra_assignments (kra_id, employee_code, period, status)
                    VALUES (?, ?, ?, 'Assigned')
                """, (kra_id, code, period))
                count += 1
                
        conn.commit()
        return {"success": True, "message": f"Successfully assigned {len(kra_ids)} KRAs to {len(employees_to_assign)} employees."}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# --- 5. Delete KRA ---
@router.delete("/kras/{kra_id}")
def delete_kra(kra_id: int):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Check if KRA exists
        c.execute("SELECT id FROM kra_library WHERE id = ?", (kra_id,))
        if not c.fetchone():
            raise HTTPException(status_code=404, detail="KRA not found")
        
        # Delete KRA (this will also delete assignments if CASCADE is set, otherwise manual cleanup)
        c.execute("DELETE FROM kra_assignments WHERE kra_id = ?", (kra_id,))
        c.execute("DELETE FROM kra_library WHERE id = ?", (kra_id,))
        
        conn.commit()
        return {"success": True, "message": "KRA deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# --- 6. Get Group Members ---
@router.get("/groups/{group_id}/members")
def get_group_members(group_id: int):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Get group info
        c.execute("SELECT * FROM employee_groups WHERE id = ?", (group_id,))
        group = c.fetchone()
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Get members with employee details
        c.execute("""
            SELECT e.employee_code, e.name, e.team, e.designation
            FROM employee_group_members egm
            JOIN employees e ON egm.employee_code = e.employee_code
            WHERE egm.group_id = ?
        """, (group_id,))
        members = [dict(row) for row in c.fetchall()]
        
        return {
            "group": dict(group),
            "members": members
        }
    finally:
        conn.close()

# --- 7. Update Group Members (Add/Remove) ---
@router.put("/groups/{group_id}/members")
def update_group_members(group_id: int, data: dict = Body(...)):
    # Expected: { add: ["EMP001"], remove: ["EMP002"] }
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Check if group exists
        c.execute("SELECT id FROM employee_groups WHERE id = ?", (group_id,))
        if not c.fetchone():
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Remove members
        to_remove = data.get('remove', [])
        for code in to_remove:
            c.execute("DELETE FROM employee_group_members WHERE group_id = ? AND employee_code = ?", (group_id, code))
        
        # Add members
        to_add = data.get('add', [])
        for code in to_add:
            # Check if already exists
            c.execute("SELECT * FROM employee_group_members WHERE group_id = ? AND employee_code = ?", (group_id, code))
            if not c.fetchone():
                c.execute("INSERT INTO employee_group_members (group_id, employee_code) VALUES (?, ?)", (group_id, code))
        
        conn.commit()
        return {"success": True, "message": f"Updated group members: added {len(to_add)}, removed {len(to_remove)}"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# --- 8. Delete Group ---
@router.delete("/groups/{group_id}")
def delete_group(group_id: int):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Check if group exists
        c.execute("SELECT id FROM employee_groups WHERE id = ?", (group_id,))
        if not c.fetchone():
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Delete group members first
        c.execute("DELETE FROM employee_group_members WHERE group_id = ?", (group_id,))
        
        # Delete the group
        c.execute("DELETE FROM employee_groups WHERE id = ?", (group_id,))
        
        conn.commit()
        return {"success": True, "message": "Group deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
