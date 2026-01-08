from typing import List, Dict, Any, Optional
from backend.database import get_db_connection

class AdminRepository:
    def get_all_users(self) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            rows = conn.execute("SELECT id, username, role FROM users ORDER BY id").fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def log_action(self, username: str, action: str, details: str, ip: str = None):
        conn = get_db_connection()
        try:
             conn.execute("INSERT INTO audit_logs (username, action, details, ip_address) VALUES (?, ?, ?, ?)", 
                          (username, action, details, ip))
             conn.commit()
        finally:
            conn.close()

    def get_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            rows = conn.execute(f"SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT {limit}").fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()
