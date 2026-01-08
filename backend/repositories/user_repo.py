from typing import Optional, Dict, Any, List
from backend.database import get_db_connection

class UserRepository:
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def create_user(self, username: str, password_hash: str, role: str, employee_code: Optional[str] = None):
        conn = get_db_connection()
        try:
            conn.execute(
                "INSERT INTO users (username, password_hash, role, employee_code) VALUES (?, ?, ?, ?)",
                (username, password_hash, role, employee_code)
            )
            conn.commit()
        finally:
            conn.close()

    def update_password(self, username: str, new_hash: str):
        conn = get_db_connection()
        try:
            conn.execute("UPDATE users SET password_hash = ? WHERE username = ?", (new_hash, username))
            conn.commit()
        finally:
            conn.close()

    def update_last_login(self, username: str):
        conn = get_db_connection()
        try:
            conn.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE username = ?", (username,))
            conn.commit()
        finally:
            conn.close()

    def get_all_users(self) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            rows = conn.execute("SELECT * FROM users").fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def delete_user(self, username: str):
        conn = get_db_connection()
        try:
            conn.execute("DELETE FROM users WHERE username = ?", (username,))
            conn.commit()
        finally:
            conn.close()
            
    # Session Management (If we move to DB sessions totally)
    def create_session(self, session_token: str, user_id: int):
        conn = get_db_connection()
        try:
             conn.execute("INSERT INTO sessions (session_token, user_id) VALUES (?, ?)", (session_token, user_id))
             conn.commit()
        finally:
             conn.close()

    def get_session(self, session_token: str):
        conn = get_db_connection()
        try:
             row = conn.execute("SELECT * FROM sessions WHERE session_token = ?", (session_token,)).fetchone()
             return dict(row) if row else None
        finally:
             conn.close()

    def delete_session(self, session_token: str):
        conn = get_db_connection()
        try:
             conn.execute("DELETE FROM sessions WHERE session_token = ?", (session_token,))
             conn.commit()
        finally:
            conn.close()
