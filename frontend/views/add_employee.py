import streamlit as st
import sqlite3
import os
from datetime import date

# Get the base directory for file operations
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'data', 'employee.db')

def add_employee_record(data):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    try:
        # 1. Employees Table
        c.execute('''
            INSERT INTO employees (
                employee_code, name, dob, contact_number, emergency_contact, email_id, doj, 
                team, designation, employment_type, reporting_manager, location, 
                pf_included, mediclaim_included, cv_path, employment_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
        ''', (
            data['code'], data['name'], data['dob'], data['phone'], data['emergency'], 
            data['email'], data['doj'], data['team'], data['role'], data['type'], 
            data['manager'], data['location'], data['pf'], data['mediclaim'], data['cv_upload']
        ))
        
        # 2. Skill Matrix Table
        c.execute('''
            INSERT INTO skill_matrix (
                employee_code,candidate_name,primary_skillset,
                secondary_skillset,experience_years,last_contact_date,cv_upload
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['code'], data['name'], data['primary_skillset'], data['secondary_skillset'],
            data['experience_years'], data['last_contact_date'], data['cv_upload']
        ))
        
        # 3. Assets Table
        c.execute('''
            INSERT INTO assets (
                employee_code,asset_id,issued_to,issue_date,return_date,advance_salary_adjustment,
                leave_adjustment,laptop_returned,laptop_bag_returned,remove_from_medical,remove_from_pf,
                email_access_removed,removed_from_groups,relieving_letter_shared
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['code'], data.get('assetid'), data.get('issued_to'), data.get('issue_date'),data.get('return_date'),
            data.get('advance_salary_adjustment'), data.get('leave_adjustment'), data.get('laptop_returned'),
            data.get('laptop_bag_returned'), data.get('remove_from_medical'), data.get('remove_from_pf'),
            data.get('email_access_removed'), data.get('removed_from_groups'), data.get('relieving_letter_shared')
        ))

        # 4. Performance Table
        c.execute('''
            INSERT INTO performance (
                employee_code, employee_name, monthly_check_in_notes, manager_feedback, 
                improvement_areas, recognition_rewards
            ) VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data['code'], data['name'], data.get('monthly_check_in_notes'), 
            data.get('manager_feedback'), data.get('improvement_areas'), 
            data.get('recognition_rewards')
        ))
        
        # 5. HR Activity Table
        c.execute('''
            INSERT INTO hr_activity (
                employee_code, employee_name, training_assigned, status, last_follow_up
            ) VALUES (?, ?, ?, ?, ?)
        ''', (
            data['code'], data['name'], data.get('training_assigned'), 
            data.get('status'), data.get('last_follow_up')
        ))
        
        conn.commit()
        return True, "Employee added successfully!"
    except sqlite3.IntegrityError:
        return False, "Error: Employee Code or Email already exists."
    except Exception as e:
        return False, f"An error occurred: {e}"
    finally:
        conn.close()

def show_add_employee():
    st.title("Add New Employee")
    st.markdown("Enter the details of the new joiner below.")

    with st.form("add_employee_form"):
        # Section 1: Personal Info
        st.subheader("Personal Details")
        c1, c2, c3 = st.columns(3)
        with c1:
            name = st.text_input("Full Name *")
            dob = st.date_input("Date of Birth", min_value=date(1960, 1, 1))
        with c2:
            phone = st.text_input("Contact Number *")
            email = st.text_input("Official Email *")
        with c3:
            emergency = st.text_input("Emergency Contact")
            location = st.selectbox("Location", ["Bangalore", "Hyderabad", "Remote", "Delhi", "Mumbai"])
    
        st.divider()
    
        # Section 2: Work Info
        st.subheader("Employment Details")
        c4, c5, c6 = st.columns(3)
        with c4:
            code = st.text_input("Employee Code * (e.g., EMP101)")
            doj = st.date_input("Date of Joining", value=date.today())
            emp_type = st.selectbox("Employment Type", ["Full-time", "Contract", "Intern"])
        with c5:
            team = st.selectbox("Department", ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"])
            role = st.text_input("Designation *")
        with c6:
            manager = st.text_input("Reporting Manager")
            pf = st.selectbox("PF Included?", ["Yes", "No"])
            mediclaim = st.selectbox("Mediclaim Included?", ["Yes", "No"])
        
        st.divider()
        # Section 3: Skill Matrix
        st.subheader("Skill Matrix")
        c7, c8, c9 = st.columns(3)
        with c7:
            skill1 = st.text_input("Primary Skill")
            skill2 = st.text_input("Secondary Skill")
        with c8:
            exyears = st.text_input("Years of Experience")
            last_contact_date = st.date_input("Last Contact Date", value=date.today())
        
        with c9:
            cv = st.file_uploader("CV")
        
        # Section 4: ASSETS
        st.subheader("Assets")
        c10, c11, c12 = st.columns(3)
        with c10:
            assetid = st.text_input("Asset ID")
            st.write(f"**Issued To:** (Will be set to {name if name else 'Employee Name'})") 
            issue_date = st.date_input("Issue Date", value=date.today())
            return_date = st.date_input("Return Date", value=date.today())
            advance_salary_adjustment = st.text_input("Advance Salary Adjustment")
        with c11:
            leave_adjustment = st.selectbox("Leave Adjustment", ["Yes", "No"])
            laptop_returned = st.selectbox("Laptop Returned", ["Yes", "No"])
            laptop_bag_returned = st.selectbox("Laptop Bag Returned", ["Yes", "No"])
            remove_from_medical = st.selectbox("Remove From Medical", ["Yes", "No"])
        with c12:
            remove_from_pf = st.selectbox("Remove From PF", ["Yes", "No"])
            email_access_removed = st.selectbox("Email Access Removed", ["Yes", "No"])
            removed_from_groups = st.selectbox("Removed From Groups", ["Yes", "No"])
            relieving_letter_shared = st.selectbox("Relieving Letter Shared", ["Yes", "No"])
    
        # Section 5: HR Activity/Performance
        st.subheader("HR Activity/Performance")
        c13, c14 = st.columns(2)
        with c13:
            training_assigned = st.text_input("Training Assigned")
            status = st.selectbox("Status", ["Active", "Exited"])
        with c14:
            last_follow_up = st.date_input("Last Follow Up", value=date.today())
            monthly_check_in_notes = st.text_area("Monthly Check-in Notes")
            manager_feedback = st.text_area("Manager Feedback")
            improvement_areas = st.text_area("Improvement Areas")
            recognition_rewards = st.text_area("Recognition & Rewards")
        st.divider()
    
        st.markdown("**Note**: Fields marked with * are mandatory.")
        
        submitted = st.form_submit_button("Save Employee", type="primary")
    
        if submitted:
            if not name or not phone or not email or not code or not role:
                st.error("Please fill in all mandatory fields.")
                
            else:
                #CV UPLOAD HANDLING
                cv_upload = None
    
                if cv is not None:
                    cv_dir = os.path.join(BASE_DIR, 'data', 'uploaded_cvs')
                    os.makedirs(cv_dir, exist_ok=True)
                    
                    file_ext = os.path.splitext(cv.name)[1]
                    file_name = f"{code}_{name.replace(' ', '_')}{file_ext}"
                    
                    save_path = os.path.join(cv_dir, file_name)
                    
                    with open(save_path, "wb") as f:
                        f.write(cv.getbuffer())
                    
                    cv_upload = os.path.join("uploaded_cvs", file_name)
    
                # Pack data
                new_emp = {
                    "name": name, "dob": dob, "phone": phone, "email": email, "emergency": emergency,
                    "location": location, "code": code, "doj": doj, "type": emp_type,
                    "team": team, "role": role, "manager": manager, "pf": pf, "mediclaim": mediclaim,
                    "primary_skillset": skill1, "secondary_skillset": skill2, "experience_years": exyears,
                    "cv_upload": cv_upload, "last_contact_date": last_contact_date,
                    "assetid": assetid, "issued_to": name, # Auto-filled here
                    "issue_date": issue_date, "return_date": return_date,
                    "advance_salary_adjustment": advance_salary_adjustment, "leave_adjustment": leave_adjustment,
                    "laptop_returned": laptop_returned == "Yes", "laptop_bag_returned": laptop_bag_returned == "Yes",
                    "remove_from_medical": remove_from_medical, "remove_from_pf": remove_from_pf,
                    "email_access_removed": email_access_removed, "removed_from_groups": removed_from_groups,
                    "relieving_letter_shared": relieving_letter_shared,
                    "training_assigned": training_assigned, "status": status, "last_follow_up": last_follow_up,
                    "monthly_check_in_notes": monthly_check_in_notes, "manager_feedback": manager_feedback,
                    "improvement_areas": improvement_areas, "recognition_rewards": recognition_rewards
                }
                
                success, msg = add_employee_record(new_emp)
                if success:
                    st.cache_data.clear()
                    st.success(msg)
                    st.balloons()
                else:
                    st.error(msg)
