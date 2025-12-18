import streamlit as st
import sqlite3
import os
from datetime import date
import pandas as pd
import io
import xlsxwriter


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
                pf_included, mediclaim_included, cv_path, photo_path, employment_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
        ''', (
            data['code'], data['name'], data['dob'], data['phone'], data['emergency'], 
            data['email'], data['doj'], data['team'], data['role'], data['type'], 
            data['manager'], data['location'], data['pf'], data['mediclaim'], 
            data['cv_upload'], data.get('photo_path'), # photo_path added
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

def show_single_entry_form():
    st.title("Add New Employee")
    st.markdown("Enter the details of the new joiner below.")

    with st.form("add_employee_form"):
        # Section 1: Personal Info
        st.subheader("Personal Details")
        c1, c2, c3 = st.columns(3)
        with c1:
            name = st.text_input("Full Name *")
            dob = st.date_input("Date of Birth", min_value=date(1960, 1, 1))
            photo = st.file_uploader("Profile Photo", type=['jpg', 'png', 'jpeg']) # Added Photo Upload
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
                # PROFILE PHOTO HANDLING
                photo_upload = None
                if photo is not None:
                    photo_dir = os.path.join(BASE_DIR, 'data', 'profile_photos')
                    os.makedirs(photo_dir, exist_ok=True)
                    
                    p_ext = os.path.splitext(photo.name)[1]
                    p_name = f"{code}_{name.replace(' ', '_')}{p_ext}"
                    p_save = os.path.join(photo_dir, p_name)
                    
                    with open(p_save, "wb") as f:
                        f.write(photo.getbuffer())
                    
                    photo_upload = os.path.join("profile_photos", p_name)

                # CV UPLOAD HANDLING
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
                    "cv_upload": cv_upload, "photo_path": photo_upload, # Added Photo
                    "last_contact_date": last_contact_date,
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
                    
def show_bulk_upload_form():
    st.subheader("Bulk Upload via Excel/CSV")

    st.markdown("### Step 1: Download Template")
    st.markdown("Please use the standard template below. Do not change the column headers.")
    
    # Create valid dataframe for template
    template_cols = [
        "Employee Code", "Full Name", "Date of Birth (YYYY-MM-DD)", "Contact Number", 
        "Official Email", "Designation", "Department", "Date of Joining (YYYY-MM-DD)",
        "Employment Type", "Location", "Reporting Manager", "Emergency Contact",
        "PF Included (Yes/No)", "Mediclaim Included (Yes/No), Primary Skils, Secondary Skills, Years of Experience"
    ]
    df_template = pd.DataFrame(columns=template_cols)
    
    # Save to buffer
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='xlsxwriter') as writer:
        df_template.to_excel(writer, index=False, sheet_name='Sheet1')
        
    st.download_button(
        label="📥 Download Excel Template",
        data=buffer.getvalue(),
        file_name="employee_upload_template.xlsx",
        mime="application/vnd.ms-excel"
    )
    
    st.divider()
    
    # File Upload
    st.markdown("### Step 2: Upload Data")
    uploaded_file = st.file_uploader("Upload Excel/CSV File", type=['csv', 'xlsx'])
    
    if uploaded_file:
        try:
            if uploaded_file.name.endswith('.csv'):
                df = pd.read_csv(uploaded_file)
            else:
                df = pd.read_excel(uploaded_file)
                
            st.success(f"File uploaded successfully! Found {len(df)} rows.")
            st.dataframe(df.head())
            
            if st.button("🚀 Process Upload", type="primary"):
                success_count = 0
                error_count = 0
                errors = []
                
                progress_bar = st.progress(0)
                
                for i, row in df.iterrows():
                    try:
                        if pd.isna(row["Employee Code"]) or pd.isna(row["Full Name"]):
                            raise ValueError("Missing Code or Name")

                        emp_data = {
                            "code": str(row["Employee Code"]),
                            "name": str(row["Full Name"]),
                            "dob": str(row["Date of Birth (YYYY-MM-DD)"]) if not pd.isna(row["Date of Birth (YYYY-MM-DD)"]) else None,
                            "phone": str(row["Contact Number"]),
                            "email": str(row["Official Email"]),
                            "role": str(row["Designation"]),
                            "team": str(row["Department"]),
                            "doj": str(row["Date of Joining (YYYY-MM-DD)"]) if not pd.isna(row["Date of Birth (YYYY-MM-DD)"]) else None,
                            "type": str(row["Employment Type"]),
                            "location": str(row["Location"]),
                            "manager": str(row["Reporting Manager"]),
                            "emergency": str(row["Emergency Contact"]),
                            "pf": str(row["PF Included (Yes/No)"]),
                            "mediclaim": str(row["Mediclaim Included (Yes/No)"]),
                            "cv_upload": None,
                            "primary_skillset": "", "secondary_skillset": "", "experience_years": "",
                            "last_contact_date": None,
                            "assetid": None, "issued_to": str(row["Full Name"]),
                            "issue_date": None, "return_date": None,
                            "advance_salary_adjustment": "", "leave_adjustment": "No",
                            "laptop_returned": False, "laptop_bag_returned": False,
                            "remove_from_medical": "No", "remove_from_pf": "No",
                            "email_access_removed": "No", "removed_from_groups": "No",
                            "relieving_letter_shared": "No",
                            "training_assigned": "", "status": "Active", "last_follow_up": None,
                            "monthly_check_in_notes": "", "manager_feedback": "",
                            "improvement_areas": "", "recognition_rewards": ""
                        }
                        
                        success_flag, msg = add_employee_record(emp_data)
                        if success_flag:
                            success_count += 1
                        else:
                            error_count += 1
                            errors.append(f"Row {i+1}: {msg}")
                            
                    except Exception as e:
                        error_count += 1
                        errors.append(f"Row {i+1}: {e}")
                    
                    progress_bar.progress((i + 1) / len(df))
                
                st.success(f"Processed: {success_count} added, {error_count} failed.")
                if errors:
                    with st.expander("View Error Log"):
                        for e in errors:
                            st.write(e)
                            
                st.cache_data.clear()

        except Exception as e:
            st.error(f"Error reading file: {e}")

def show_add_employee():
    st.title("Add New Employee")
    st.markdown("Choose your preferred method to add employees.")
    
    t1, t2 = st.tabs(["Single Entry", "Bulk Upload"])
    
    with t1:
        show_single_entry_form()
    with t2:
        show_bulk_upload_form()
