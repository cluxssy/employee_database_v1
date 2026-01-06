from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Optional
from pydantic import BaseModel
from datetime import datetime
from backend.database import get_db_connection
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/api/assessments", tags=["Quarterly Assessments"])

# --- Constant Template ---
TEMPLATE = {
    "Performance": [
        "Adherence to schedules",
        "Quality of deliverables",
        "Stakeholder feedback",
        "Team contribution"
    ],
    "Potential": [
        "Communication and influence",
        "Problem-solving",
        "Adaptability"
    ],
    "Values": [
        "Integrity and accountability",
        "Teamwork and collaboration",
        "Initiative and proactivity"
    ],
    "Growth and Development": [
        "Learning and upskilling",
        "Team development contribution"
    ],
    "Impact": [
        "Creativity and originality",
        "Business goal contributions"
    ]
}

# --- Models ---
class AssessmentEntry(BaseModel):
    category: str
    subcategory: str
    self_score: int = 0
    manager_score: int = 0
    score: int = 0
    manager_comment: Optional[str] = ""
    employee_comment: Optional[str] = ""

class AssessmentQuarter(BaseModel):
    quarter: str # Q1, Q2, Q3, Q4
    status: str
    entries: List[AssessmentEntry]
    total_score: int
    percentage: float

class SaveAssessmentRequest(BaseModel):
    employee_code: str
    year: int
    quarter: str
    entries: List[AssessmentEntry]
    status: str = "Draft"

# --- Endpoints ---

@router.get("/{employee_code}/{year}")
def get_assessments(employee_code: str, year: int, user=Depends(get_current_user)):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Auth Check
        is_authorized = False
        if user['role'] in ['Admin', 'HR']:
            is_authorized = True
        elif user['employee_code'] == employee_code:
            is_authorized = True
        elif user['role'] == 'Management':
            # Check if target employee reports to this manager
            # We check both name and code to be safe as reporting_manager field is free text
            c.execute("SELECT name FROM employees WHERE employee_code = ?", (user['employee_code'],))
            mgr_row = c.fetchone()
            mgr_name = mgr_row['name'] if mgr_row else ""

            c.execute("SELECT reporting_manager FROM employees WHERE employee_code = ?", (employee_code,))
            target_emp = c.fetchone()
            if target_emp:
                rep_mgr = target_emp['reporting_manager']
                if rep_mgr == mgr_name or rep_mgr == user['employee_code']:
                    is_authorized = True
        
        if not is_authorized:
            raise HTTPException(status_code=403, detail="Not authorized to view this assessment")

        # Fetch existing assessments
        rows = c.execute('''
            SELECT * FROM quarterly_assessments 
            WHERE employee_code = ? AND year = ?
        ''', (employee_code, year)).fetchall()
        
        assessments_map = {}
        for row in rows:
            assessments_map[row['quarter']] = dict(row)

        result = []
        quarters = ['Q1', 'Q2', 'Q3', 'Q4']

        for q in quarters:
            if q in assessments_map:
                # Load entries
                meta = assessments_map[q]
                entries_rows = c.execute('''
                    SELECT category, subcategory, self_score, manager_score, score, manager_comment, employee_comment 
                    FROM assessment_entries WHERE assessment_id = ?
                ''', (meta['id'],)).fetchall()
                
                # Check for any MISSING categories in DB (in case template changed)
                entries_dict = {(r['category'], r['subcategory']): dict(r) for r in entries_rows}
                
                final_entries = []
                for cat, subcats in TEMPLATE.items():
                    for sub in subcats:
                        if (cat, sub) in entries_dict:
                            final_entries.append(entries_dict[(cat, sub)])
                        else:
                            final_entries.append({
                                "category": cat, "subcategory": sub, 
                                "self_score": 0, "manager_score": 0, "score": 0, "manager_comment": "", "employee_comment": ""
                            })
                
                result.append({
                    "quarter": q,
                    "status": meta['status'],
                    "total_score": meta['total_score'],
                    "percentage": meta['percentage'],
                    "entries": final_entries,
                    "exists": True
                })
            else:
                # Return Empty Template
                empty_entries = []
                for cat, subcats in TEMPLATE.items():
                    for sub in subcats:
                        empty_entries.append({
                            "category": cat,
                            "subcategory": sub,
                            "self_score": 0,
                            "manager_score": 0,
                            "score": 0,
                            "manager_comment": "",
                            "employee_comment": ""
                        })
                result.append({
                    "quarter": q,
                    "status": "Not Started",
                    "total_score": 0,
                    "percentage": 0.0,
                    "entries": empty_entries,
                    "exists": False
                })

        return result
    finally:
        conn.close()

@router.post("/save")
def save_assessment(req: SaveAssessmentRequest, user=Depends(get_current_user)):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        # Auth Check
        is_authorized = False
        if user['role'] in ['Admin', 'HR']:
            is_authorized = True
        elif user['employee_code'] == req.employee_code:
            is_authorized = True
        elif user['role'] == 'Management':
             # Management Auth Check
            c.execute("SELECT name FROM employees WHERE employee_code = ?", (user['employee_code'],))
            mgr_row = c.fetchone()
            mgr_name = mgr_row['name'] if mgr_row else ""

            c.execute("SELECT reporting_manager FROM employees WHERE employee_code = ?", (req.employee_code,))
            target_emp = c.fetchone()
            if target_emp:
                rep_mgr = target_emp['reporting_manager']
                if rep_mgr == mgr_name or rep_mgr == user['employee_code']:
                    is_authorized = True
        
        if not is_authorized:
             raise HTTPException(status_code=403, detail="Not authorized to edit this assessment")

        # Status Logic
        final_status = req.status
        if user['role'] == 'Employee' and req.status == 'Submitted':
             final_status = 'Submitted'
        elif user['role'] == 'Management' and req.status == 'Submitted':
             final_status = 'Reviewed' # Auto move to next stage if manager touches it

        # 1. Upsert Assessment Header
        c.execute('''
            SELECT id FROM quarterly_assessments 
            WHERE employee_code = ? AND year = ? AND quarter = ?
        ''', (req.employee_code, req.year, req.quarter))
        header = c.fetchone()

        # Calculate Totals - Based on Manager Score (Official)
        # If manager score is 0 and self score > 0 (just submitted), we might display self score, but official is Manager.
        # Actually total_score should strictly be manager_score sum for final report.
        total_score = sum(e.manager_score for e in req.entries)
        # Total possible based on items
        max_score = len(req.entries) * 10
        percentage = round((total_score / max_score) * 100, 1) if max_score > 0 else 0

        if header:
            assessment_id = header['id']
            c.execute('''
                UPDATE quarterly_assessments 
                SET status = ?, total_score = ?, percentage = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (final_status, total_score, percentage, assessment_id))
        else:
            c.execute('''
                INSERT INTO quarterly_assessments (employee_code, year, quarter, status, total_score, percentage)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (req.employee_code, req.year, req.quarter, final_status, total_score, percentage))
            assessment_id = c.lastrowid

        # 2. Update Entries
        c.execute("DELETE FROM assessment_entries WHERE assessment_id = ?", (assessment_id,))
        
        for e in req.entries:
            c.execute('''
                INSERT INTO assessment_entries (assessment_id, category, subcategory, self_score, manager_score, score, manager_comment, employee_comment)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (assessment_id, e.category, e.subcategory, e.self_score, e.manager_score, e.score, e.manager_comment, e.employee_comment))

        conn.commit()
        return {"success": True, "message": "Assessment saved successfully"}
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
