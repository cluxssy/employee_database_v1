import sqlite3
import os
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.database import get_db_connection

from backend.auth import create_user

def reset_users():
    print("Deleting all users from 'users' table...")
    conn = get_db_connection()
    c = conn.cursor()

    try:
        c.execute("DELETE FROM users")
        conn.commit()
        print(f"Successfully deleted all users. Row count: {c.rowcount}")
        
        # Create new Manager
        print("Creating new Manager user...")
        if create_user("manager", "password123", "Management"):
            print("Manager user created successfully: manager / password123")
        else:
            print("Failed to create manager user.")
            
    except Exception as e:
        print(f"Error resetting users: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    reset_users()
