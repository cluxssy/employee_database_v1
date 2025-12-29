import sqlite3
from passlib.hash import pbkdf2_sha256
from backend.database import get_db_connection

def verify_user(username, password):
    """
    Checks if username exists and password matches the hash.
    Returns: (True, role) if valid, (False, None) if invalid.
    """
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        c.execute("SELECT password_hash, role FROM users WHERE username = ?", (username,))
        result = c.fetchone()
        conn.close()
        
        if result:
            db_hash = result['password_hash']
            role = result['role']
            
            # Verify password
            if pbkdf2_sha256.verify(password, db_hash):
                return True, role
                
        return False, None
        
    except Exception as e:
        print(f"Auth Error: {e}")
        return False, None

def create_user(username, password, role):
    """
    Creates a new user with a hashed password.
    """
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        # Hash the password
        hashed_pw = pbkdf2_sha256.hash(password)
        
        c.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
                  (username, hashed_pw, role))
        
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Create User Error: {e}")
        return False

def get_all_users():
    """
    Returns a list of all users: [(username, role), ...]
    """
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT username, role FROM users")
        users = c.fetchall() 
        conn.close()
        return users
    except Exception as e:
        print(f"Fetch Users Error: {e}")
        return []

def delete_user(username):
    """
    Deletes a user by username.
    """
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("DELETE FROM users WHERE username = ?", (username,))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Delete User Error: {e}")
        return False

def update_password(username, new_password):
    """
    Updates the password for a user.
    """
    try:
        conn = get_db_connection()
        c = conn.cursor()
        hashed_pw = pbkdf2_sha256.hash(new_password)
        c.execute("UPDATE users SET password_hash = ? WHERE username = ?", (hashed_pw, username))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Update Password Error: {e}")
        return False
