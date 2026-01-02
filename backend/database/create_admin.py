import sqlite3
import os
from passlib.hash import pbkdf2_sha256

# Define Base Directory and DB Path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, 'data', 'employee.db')

def get_db_connection():
    """Create a database connection"""
    if not os.path.exists(os.path.dirname(DB_PATH)):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_admin_user():
    print(f"--- Create Admin User ---")
    print(f"Target Database: {DB_PATH}\n")

    username = input("Enter Username [default: admin]: ").strip() or "admin"
    password = input("Enter Password [default: admin123]: ").strip() or "admin123"
    
    conn = get_db_connection()
    c = conn.cursor()
    
    try:
        # Check if user exists
        c.execute("SELECT id FROM users WHERE username = ?", (username,))
        existing = c.fetchone()
        
        password_hash = pbkdf2_sha256.hash(password)
        
        if existing:
            overwrite = input(f"User '{username}' already exists. Overwrite password? (y/n): ").lower()
            if overwrite == 'y':
                c.execute("""
                    UPDATE users 
                    SET password_hash = ?, role = 'Admin', is_active = 1 
                    WHERE username = ?
                """, (password_hash, username))
                print(f"Successfully updated password for user: {username}")
            else:
                print("Operation cancelled.")
                return
        else:
            c.execute("""
                INSERT INTO users (username, password_hash, role, is_active)
                VALUES (?, ?, 'Admin', 1)
            """, (username, password_hash))
            print(f"Successfully created admin user: {username}")
        
        conn.commit()
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_admin_user()
