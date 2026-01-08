from typing import Dict, Any, List, Optional
from backend.database import get_db_connection

class AssessmentRepository:
    def get_employee_manager_name(self, employee_code: str) -> Optional[str]:
        conn = get_db_connection()
        try:
             row = conn.execute("SELECT name FROM employees WHERE employee_code = ?", (employee_code,)).fetchone()
             return row['name'] if row else None
        finally:
            conn.close()

    def get_employee_reporting_manager(self, employee_code: str) -> Optional[str]:
        conn = get_db_connection()
        try:
             row = conn.execute("SELECT reporting_manager FROM employees WHERE employee_code = ?", (employee_code,)).fetchone()
             return row['reporting_manager'] if row else None
        finally:
            conn.close()

    def get_assessments_meta(self, employee_code: str, year: int) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            rows = conn.execute('''
                SELECT * FROM quarterly_assessments 
                WHERE employee_code = ? AND year = ?
            ''', (employee_code, year)).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def get_assessment_entries(self, assessment_id: int) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            rows = conn.execute('''
                SELECT category, subcategory, self_score, manager_score, score, manager_comment, employee_comment 
                FROM assessment_entries WHERE assessment_id = ?
            ''', (assessment_id,)).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def upsert_assessment_header(self, employee_code: str, year: int, quarter: str, status: str, total_score: int, percentage: float) -> int:
        conn = get_db_connection()
        try:
            # Check exist
            row = conn.execute('''
                SELECT id FROM quarterly_assessments 
                WHERE employee_code = ? AND year = ? AND quarter = ?
            ''', (employee_code, year, quarter)).fetchone()
            
            if row:
                aid = row['id']
                conn.execute('''
                    UPDATE quarterly_assessments 
                    SET status = ?, total_score = ?, percentage = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (status, total_score, percentage, aid))
                conn.commit()
                return aid
            else:
                cur = conn.execute('''
                    INSERT INTO quarterly_assessments (employee_code, year, quarter, status, total_score, percentage)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (employee_code, year, quarter, status, total_score, percentage))
                conn.commit()
                return cur.lastrowid
        finally:
             conn.close()

    def replace_entries(self, assessment_id: int, entries: List[dict]):
        conn = get_db_connection()
        try:
            conn.execute("DELETE FROM assessment_entries WHERE assessment_id = ?", (assessment_id,))
            for e in entries:
                conn.execute('''
                    INSERT INTO assessment_entries (assessment_id, category, subcategory, self_score, manager_score, score, manager_comment, employee_comment)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    assessment_id, 
                    e.get('category'), e.get('subcategory'), 
                    e.get('self_score'), e.get('manager_score'), e.get('score'), 
                    e.get('manager_comment'), e.get('employee_comment')
                ))
            conn.commit()
        finally:
            conn.close()
