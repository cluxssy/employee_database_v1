import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'data', 'employee.db')

print(f"Database will be created at: {DB_PATH}")

def get_db_connection():

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_tables():
    conn = get_db_connection()
    c = conn.cursor()
    
    print("Creating tables...")

    # 1) Employees Table
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
            current_address TEXT,
            permanent_address TEXT,
            checklist_bag INTEGER DEFAULT 0,
            checklist_mediclaim INTEGER DEFAULT 0,
            checklist_pf INTEGER DEFAULT 0,
            checklist_email_access INTEGER DEFAULT 0,
            checklist_groups INTEGER DEFAULT 0,
            checklist_relieving_letter INTEGER DEFAULT 0,
            employment_status TEXT DEFAULT 'Active',
            photo_path TEXT,
            cv_path TEXT,
            id_proofs TEXT,
            pf_included TEXT,
            mediclaim_included TEXT,
            notes TEXT,
            exit_date TEXT,
            exit_reason TEXT,
            clearance_status TEXT
        )
    ''')
    
    # 2) Users Table 
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT CHECK(role IN ('HR', 'Admin', 'Management')) NOT NULL
        )
    ''')

    # 3) Skill Matrix Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS skill_matrix (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_code TEXT,
            candidate_name TEXT,
            primary_skillset TEXT,
            secondary_skillset TEXT,
            experience_years REAL,
            last_contact_date TEXT,
            cv_upload TEXT
        )
    ''')

    # 4) Assets Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_code TEXT,
            asset_id TEXT,
            issued_to TEXT,
            issue_date TEXT,
            return_date TEXT,
            advance_salary_adjustment TEXT,
            leave_adjustment TEXT,
            laptop_returned BOOLEAN
        )
    ''')

    # 5) HR Activity Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS hr_activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_code TEXT,
            employee_name TEXT,
            training_assigned TEXT,
            training_date TEXT,
            training_duration TEXT,
            training_status TEXT,
            status TEXT,
            last_follow_up TEXT
        )
    ''')

    # 6) Performance Table
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

    # 7) KRA Library Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS kra_library (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            goal_name TEXT,
            description TEXT,
            weightage REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 8) KRA Assignments Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS kra_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kra_id INTEGER NOT NULL,
            employee_code TEXT NOT NULL,
            period TEXT,
            status TEXT DEFAULT 'Assigned',
            self_rating REAL,
            manager_rating REAL,
            final_score REAL,
            comments TEXT,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (kra_id) REFERENCES kra_library(id),
            FOREIGN KEY (employee_code) REFERENCES employees(employee_code)
        )
    ''')

    # 9) Employee Groups Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS employee_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 10) Employee Group Members Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS employee_group_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            employee_code TEXT NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES employee_groups(id)
        )
    ''')

    # 11) Training Programs Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS training_programs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            program_name TEXT NOT NULL,
            description TEXT,
            default_duration TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 12) Training Assignments Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS training_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_code TEXT NOT NULL,
            program_id INTEGER NOT NULL,
            training_date TEXT,
            duration TEXT,
            status TEXT DEFAULT 'Pending',
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (program_id) REFERENCES training_programs(id)
        )
    ''')

    # 13) Audit Logs Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            action TEXT NOT NULL,
            details TEXT,
            ip_address TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()
    print("Tables created successfully!")

if __name__ == "__main__":
    create_tables()
