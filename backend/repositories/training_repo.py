import sqlite3
from typing import Dict, Any, List, Optional
from backend.database import get_db_connection

class TrainingRepository:
    def get_all_programs(self) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            rows = conn.execute("SELECT * FROM training_library ORDER BY created_at DESC").fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def create_program(self, name: str, desc: str, duration: str):
        conn = get_db_connection()
        try:
            conn.execute("""
                INSERT INTO training_library (program_name, description, default_duration)
                VALUES (?, ?, ?)
            """, (name, desc, duration))
            conn.commit()
        finally:
            conn.close()

    def get_program_by_id(self, prog_id: int) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            row = conn.execute("SELECT * FROM training_library WHERE id = ?", (prog_id,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def create_assignment(self, code: str, prog_id: int, prog_name: str, date: str, duration: str):
        conn = get_db_connection()
        try:
            conn.execute("""
                INSERT INTO hr_activity (
                    employee_code, program_id, training_assigned, training_date, 
                    training_duration, training_status
                ) VALUES (?, ?, ?, ?, ?, 'Pending')
            """, (code, prog_id, prog_name, date, duration))
            conn.commit()
        finally:
            conn.close()

    def get_all_assignments(self) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
             rows = conn.execute("""
                SELECT 
                    h.id, 
                    h.employee_code, 
                    e.name as employee_name,
                    h.program_id,
                    t.program_name,
                    h.training_date,
                    h.training_status,
                    h.training_duration
                FROM hr_activity h
                LEFT JOIN employees e ON h.employee_code = e.employee_code
                LEFT JOIN training_library t ON h.program_id = t.id
                ORDER BY h.id DESC
            """).fetchall()
             return [dict(r) for r in rows]
        finally:
            conn.close()

    def update_assignment_status(self, id: int, status: str):
        conn = get_db_connection()
        try:
            conn.execute("""
                UPDATE hr_activity 
                SET training_status = ? 
                WHERE id = ?
            """, (status, id))
            conn.commit()
        finally:
            conn.close()
