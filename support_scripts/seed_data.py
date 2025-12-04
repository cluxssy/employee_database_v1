import sqlite3
import os
import random
from datetime import datetime, timedelta


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, 'data', 'employee.db')

print(DB_PATH)
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

FIRST_NAMES = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Priyanshu", "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Kiara", "Myra", "Riya", "Anvi", "Angel"]
LAST_NAMES = ["Sharma", "Verma", "Gupta", "Malhotra", "Bhatia", "Mehta", "Joshi", "Nair", "Patel", "Reddy", "Singh", "Kumar", "Das", "Chopra", "Kapoor", "Saxena", "Iyer", "Rao", "Gowda", "Pillai"]
TEAMS = ["Engineering", "Product", "Sales", "Marketing", "HR", "Finance", "Operations", "Design"]
DESIGNATIONS = ["Associate", "Senior Associate", "Manager", "Senior Manager", "Lead", "Director", "Intern"]
LOCATIONS = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai"]
SKILLS = ["Python", "Java", "SQL", "React", "Node.js", "AWS", "Excel", "PowerBI", "Salesforce", "Figma"]
MANAGERS = ["Rajesh Kumar", "Sneha Gupta", "Amit Singh", "Priya Sharma"]

def generate_dummy_data():
    conn = get_db_connection()
    c = conn.cursor()
    
    print("Generating 50 dummy employees...")
    
    for i in range(1, 51):

        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        name = f"{first} {last}"
        emp_code = f"EMP{str(i).zfill(3)}"
        email = f"{first.lower()}.{last.lower()}@ewandz.com"
        
        start_date = datetime(2020, 1, 1)
        end_date = datetime(2024, 1, 1)
        doj_obj = start_date + timedelta(days=random.randint(0, (end_date - start_date).days))
        doj = doj_obj.strftime("%Y-%m-%d")
        dob = (doj_obj - timedelta(days=365*random.randint(22, 40))).strftime("%Y-%m-%d")
        
        # Status Logic
        status = "Active"
        exit_date = None
        exit_reason = None
        clearance_status = None
        
        if random.random() < 0.2: 
            status = "Exited"
            exit_date_obj = doj_obj + timedelta(days=random.randint(100, 800))
            exit_date = exit_date_obj.strftime("%Y-%m-%d")
            exit_reason = random.choice(["Better Opportunity", "Personal Reasons", "Higher Studies", "Relocation"])
            clearance_status = random.choice(["Cleared", "Pending"])

        # Insert Employee
        c.execute('''
            INSERT OR IGNORE INTO employees (
                employee_code, name, dob, contact_number, emergency_contact, email_id, doj, 
                team, designation, employment_type, reporting_manager, location, employment_status, 
                pf_included, mediclaim_included, training_completion, notes,
                exit_date, exit_reason, clearance_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            emp_code, name, dob, f"98{random.randint(10000000, 99999999)}", f"99{random.randint(10000000, 99999999)}",
            email, doj, random.choice(TEAMS), random.choice(DESIGNATIONS), "Full-time", 
            random.choice(MANAGERS), random.choice(LOCATIONS), status, 
            random.choice(["Yes", "No"]), random.choice(["Yes", "No"]), "Completed", "No notes",
            exit_date, exit_reason, clearance_status
        ))

        # Insert Skill Matrix
        c.execute('''
            INSERT INTO skill_matrix (employee_code, candidate_name, primary_skillset, secondary_skillset, experience_years, last_contact_date)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            emp_code, name, random.choice(SKILLS), random.choice(SKILLS), round(random.uniform(1, 15), 1), datetime.now().strftime("%Y-%m-%d")
        ))

        # Insert Assets (Only for Active)
        if status == "Active":
            c.execute('''
                INSERT INTO assets (employee_code, asset_id, issued_to, issue_date, laptop_returned, laptop_bag_returned, remove_from_medical, remove_from_pf, email_access_removed, removed_from_groups, relieving_letter_shared)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                emp_code, f"AST-{random.randint(1000, 9999)}", name, doj, False, False, False, False, False, False, False
            ))
        elif status == "Exited":
             c.execute('''
                INSERT INTO assets (employee_code, asset_id, issued_to, issue_date, return_date, laptop_returned, laptop_bag_returned, remove_from_medical, remove_from_pf, email_access_removed, removed_from_groups, relieving_letter_shared)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                emp_code, f"AST-{random.randint(1000, 9999)}", name, doj, exit_date, True, True, True, True, True, True, True
            ))

        # Insert Performance
        c.execute('''
            INSERT INTO performance (employee_code, employee_name, monthly_check_in_notes, manager_feedback, improvement_areas, recognition_rewards)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            emp_code, name, "Meeting expectations.", "Good progress this month.", "Communication", "Star Performer"
        ))

    conn.commit()
    conn.close()
    print("Successfully added 50 dummy records!")

if __name__ == "__main__":
    generate_dummy_data()
