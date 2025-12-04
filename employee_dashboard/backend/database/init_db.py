import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DB_PATH = os.path.join(BASE_DIR,'data','employee.db')

print(f"Database will be created at: {DB_PATH}")

def get_db_connection():

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)            
    conn = sqlite3.connect(DB_PATH)

    # This lets us access columns by name (row['name']) instead of index (row[0])
    conn.row_factory = sqlite3.Row          
    return conn

def create_tables():
    conn = get_db_connection()
    c = conn.cursor()
    
    print("Creating tables...")

    # 1. Employees Table (Active & Exited)
    c.execute('''
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_code TEXT UNIQUE,
            name TEXT NOT NULL,
            dob TEXT,
            contact_number TEXT,
            emergency_contact TEXT,
            email_id TEXT,
            doj TEXT,
            team TEXT,
            designation TEXT,
            employment_type TEXT,
            reporting_manager TEXT,
            location TEXT,
            employment_status TEXT DEFAULT 'Active',
            cv_path TEXT,
            id_proofs TEXT,
            laptop_details TEXT,
            training_completion TEXT,
            notes TEXT,
            exit_date TEXT,
            exit_reason TEXT
        )
    ''')
    
    # 2. Users Table (For Login)
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT CHECK(role IN ('HR', 'Admin', 'Management')) NOT NULL
        )
    ''')

    # 3. Skill Matrix Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS skill_matrix (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_code TEXT UNIQUE,
            candidate_name TEXT,
            primary_skillset TEXT,
            secondary_skillset TEXT,
            experience_years REAL,
            last_contact_date TEXT,
            cv_upload TEXT
        )
    ''')

    # 4. Assets Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_code TEXT,
            asset_id TEXT,
            issued_to TEXT,
            issue_date TEXT,
            return_date TEXT,
            laptop_returned BOOLEAN,
            laptop_bag_returned BOOLEAN,
            email_access_removed BOOLEAN,
            relieving_letter_shared BOOLEAN
        )
    ''')

    # 5. HR Activity Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS hr_activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_code TEXT,
            employee_name TEXT,
            training_assigned TEXT,
            status TEXT,
            last_follow_up TEXT
        )
    ''')

    # 6. Performance Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS performance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_code TEXT,
            employee_name TEXT,
            monthly_check_in_notes TEXT,
            manager_feedback TEXT,
            improvement_areas TEXT,
            recognition_rewards TEXT
        )
    ''')

    conn.commit()
    conn.close()
    print("Tables created successfully!")

if __name__ == "__main__":
    create_tables()