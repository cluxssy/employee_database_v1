from typing import List, Dict, Any, Optional
from backend.repositories.assessment_repo import AssessmentRepository
from backend.schemas.assessment import SaveAssessmentRequest, AssessmentEntry

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

class AssessmentService:
    def __init__(self):
        self.repo = AssessmentRepository()

    def check_authorization(self, user: dict, target_employee_code: str) -> bool:
        if user['role'] in ['Admin', 'HR']:
            return True
        if user['employee_code'] == target_employee_code:
            return True
        if user['role'] == 'Management':
            mgr_name = self.repo.get_employee_manager_name(user['employee_code'])
            rep_mgr = self.repo.get_employee_reporting_manager(target_employee_code)
            
            # Simple check: If User Name is same as Target's Manager Name
            # OR User Code is same as Target's Manager Name (if code stored)
            if rep_mgr and (rep_mgr == mgr_name or rep_mgr == user['employee_code']):
                return True
        return False

    def get_assessments(self, employee_code: str, year: int, user: dict):
        if not self.check_authorization(user, employee_code):
             raise ValueError("Not authorized to view this assessment")

        meta_list = self.repo.get_assessments_meta(employee_code, year)
        assessments_map = {row['quarter']: row for row in meta_list}
        
        result = []
        for q in ['Q1', 'Q2', 'Q3', 'Q4']:
            if q in assessments_map:
                meta = assessments_map[q]
                entries_rows = self.repo.get_assessment_entries(meta['id'])
                entries_dict = {(r['category'], r['subcategory']): r for r in entries_rows}
                
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
                # Empty Template
                empty_entries = []
                for cat, subcats in TEMPLATE.items():
                    for sub in subcats:
                        empty_entries.append({
                            "category": cat, "subcategory": sub, "self_score": 0, 
                            "manager_score": 0, "score": 0, "manager_comment": "", "employee_comment": ""
                        })
                result.append({
                    "quarter": q, "status": "Not Started", "total_score": 0, 
                    "percentage": 0.0, "entries": empty_entries, "exists": False
                })
        return result

    def save_assessment(self, req: SaveAssessmentRequest, user: dict):
        if not self.check_authorization(user, req.employee_code):
             raise ValueError("Not authorized to edit this assessment")

        final_status = req.status
        if user['role'] == 'Employee' and req.status == 'Submitted':
             final_status = 'Submitted'
        elif user['role'] == 'Management' and req.status == 'Submitted':
             final_status = 'Reviewed'

        total_score = sum(e.manager_score for e in req.entries)
        max_score = len(req.entries) * 10
        percentage = round((total_score / max_score) * 100, 1) if max_score > 0 else 0

        aid = self.repo.upsert_assessment_header(req.employee_code, req.year, req.quarter, final_status, total_score, percentage)
        
        entry_list = [e.dict() for e in req.entries]
        self.repo.replace_entries(aid, entry_list)
        
        return {"success": True, "message": "Assessment saved successfully"}
