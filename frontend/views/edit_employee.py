import streamlit as st
import sqlite3
import os
import base64

# --- DATABASE CONNECTION ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'data', 'employee.db')

def update_employee_details(emp_code, updates):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        # 1. Update Employees 
        c.execute('''
            UPDATE employees SET 
                name=?, dob=?, contact_number=?, emergency_contact=?, email_id=?, 
                location=?, doj=?, employment_type=?, team=?, designation=?, 
                reporting_manager=?, pf_included=?, mediclaim_included=?, employment_status=?, cv_path=?
            WHERE employee_code=?
        ''', (
            updates['name'], updates['dob'], updates['phone'], updates['emergency'], updates['email'],
            updates['location'], updates['doj'], updates['type'], updates['team'], updates['role'],
            updates['manager'], updates['pf'], updates['mediclaim'], updates['status'], updates['cv_path'], emp_code
        ))
        
        # 2. Update Skill Matrix 
        c.execute('''
            UPDATE skill_matrix SET
                primary_skillset=?, secondary_skillset=?, experience_years=?, last_contact_date=?, cv_upload=?
            WHERE employee_code=?
        ''', (
            updates['skill1'], updates['skill2'], updates['exyears'], updates['last_contact'], updates['cv_path'], emp_code
        ))

        # 3. Update Assets
        c.execute('''
            UPDATE assets SET
                asset_id=?, issue_date=?, return_date=?, advance_salary_adjustment=?,
                leave_adjustment=?, laptop_returned=?, laptop_bag_returned=?,
                remove_from_medical=?, remove_from_pf=?, email_access_removed=?,
                removed_from_groups=?, relieving_letter_shared=?
            WHERE employee_code=?
        ''', (
            updates['assetid'], updates['issue_date'], updates['return_date'], updates['adv_sal'],
            updates['leave_adj'], updates['lap_ret'], updates['bag_ret'],
            updates['rem_med'], updates['rem_pf'], updates['email_rem'],
            updates['grp_rem'], updates['letter_shared'], emp_code
        ))

        # 4. Update HR Activity
        c.execute('''
            UPDATE hr_activity SET
                training_assigned=?, status=?, last_follow_up=?
            WHERE employee_code=?
        ''', (
            updates['train_assign'], updates['hr_status'], updates['hr_followup'], emp_code
        ))

        # 5. Update Performance
        c.execute('''
            UPDATE performance SET
                monthly_check_in_notes=?, manager_feedback=?, improvement_areas=?, recognition_rewards=?
            WHERE employee_code=?
        ''', (
            updates['monthly_notes'], updates['mgr_feed'], updates['imp_areas'], updates['rewards'], emp_code
        ))
        
        conn.commit()
        return True, "Employee profile updated successfully (all tables)!"
    except Exception as e:
        return False, f"Update failed: {e}"
    finally:
        conn.close()

def render_edit_form(emp_code, data):
    emp = data.get('employees', {})
    skills = data.get('skill_matrix', {})
    assets = data.get('assets', {})
    hr = data.get('hr_activity', {})
    perf = data.get('performance', {})

    st.subheader(f"Editing: {emp.get('name')}")
    
    with st.form("edit_master_form"):
        t_pers, t_work, t_skill, t_asset, t_perf = st.tabs([
            "Personal", "Work", "Skills", "Assets", "Performance"
        ])
        
        # Current CV Path (Preserve if no new upload)
        current_cv_path = emp.get('cv_path') or skills.get('cv_upload')
        
        with t_pers:
            c1, c2 = st.columns(2)
            with c1:
                name = st.text_input("Name", value=emp.get('name'))
                email = st.text_input("Email", value=emp.get('email_id'))
                phone = st.text_input("Phone", value=emp.get('contact_number'))
                dob = st.text_input("DOB (YYYY-MM-DD)", value=emp.get('dob'))
            with c2:
                floc = ["Bangalore", "Hyderabad", "Remote", "Delhi", "Mumbai"]
                location = st.selectbox("Location", floc, index=floc.index(emp.get('location')) if emp.get('location') in floc else 0)
                emergency = st.text_input("Emergency Contact", value=emp.get('emergency_contact'))
                pf = st.selectbox("PF Included", ["Yes", "No"], index=0 if emp.get('pf_included') == 'Yes' else 1)
                mediclaim = st.selectbox("Mediclaim", ["Yes", "No"], index=0 if emp.get('mediclaim_included') == 'Yes' else 1)
            
            new_cv = st.file_uploader("Update CV (Leave empty to keep current)", type=['pdf', 'docx'])
            if current_cv_path:
                st.caption(f"Current CV: {current_cv_path}")

        with t_work:
            c1, c2 = st.columns(2)
            with c1:
                doj = st.text_input("DOJ (YYYY-MM-DD)", value=emp.get('doj'))
                tlist = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"]
                team = st.selectbox("Team", tlist, index=tlist.index(emp.get('team')) if emp.get('team') in tlist else 0)
                role = st.text_input("Designation", value=emp.get('designation'))
                report_mgr = st.text_input("Manager", value=emp.get('reporting_manager'))
            with c2:
                etypes = ["Full-time", "Contract", "Intern"]
                etype = st.selectbox("Type", etypes, index=etypes.index(emp.get('employment_type')) if emp.get('employment_type') in etypes else 0)
                estatus = ["Active", "Exited"]
                status = st.selectbox("Status", estatus, index=estatus.index(emp.get('employment_status')) if emp.get('employment_status') in estatus else 0)
                
                # HR Fields
                train_assign = st.text_input("Training Assigned", value=hr.get('training_assigned'))
                hr_stat = st.text_input("HR Status", value=hr.get('status'))
                hr_follow = st.text_input("Last Follow-up", value=hr.get('last_follow_up'))

        with t_skill:
            skill1 = st.text_input("Primary Skills", value=skills.get('primary_skillset'))
            skill2 = st.text_input("Secondary Skills", value=skills.get('secondary_skillset'))
            exyears = st.text_input("Exp Years", value=skills.get('experience_years'))
            last_contact = st.text_input("Last Contact Date", value=skills.get('last_contact_date'))

        with t_asset:
            c1, c2 = st.columns(2)
            with c1:
                assetid = st.text_input("Asset ID", value=assets.get('asset_id'))
                issue_date = st.text_input("Issue Date", value=assets.get('issue_date'))
                return_date = st.text_input("Return Date", value=assets.get('return_date'))
                adv_sal = st.text_input("Adv. Salary Adj", value=assets.get('advance_salary_adjustment'))
            with c2:
                leave_adj = st.selectbox("Leave Adj", ["Yes", "No"], index=0 if assets.get('leave_adjustment')=='Yes' else 1)
                lap_ret = st.selectbox("Laptop Ret", ["Yes", "No"], index=0 if assets.get('laptop_returned') else 1)
                bag_ret = st.selectbox("Bag Ret", ["Yes", "No"], index=0 if assets.get('laptop_bag_returned') else 1) 
                
            st.caption("Removals/Clearance")
            c3, c4 = st.columns(2)
            with c3:
                rem_med = st.checkbox("Remove Medical", value=bool(assets.get('remove_from_medical')))
                rem_pf = st.checkbox("Remove PF", value=bool(assets.get('remove_from_pf')))
                email_rem = st.checkbox("Remove Email", value=bool(assets.get('email_access_removed')))
            with c4:
                grp_rem = st.checkbox("Remove Groups", value=bool(assets.get('removed_from_groups')))
                letter_shared = st.checkbox("Letter Shared", value=bool(assets.get('relieving_letter_shared')))

        with t_perf:
            monthly_notes = st.text_area("Monthly Notes", value=perf.get('monthly_check_in_notes'))
            mgr_feed = st.text_area("Manager Feedback", value=perf.get('manager_feedback'))
            imp_areas = st.text_area("Improvement Areas", value=perf.get('improvement_areas'))
            rewards = st.text_area("Rewards", value=perf.get('recognition_rewards'))

        submitted = st.form_submit_button("💾 Save All Changes", type="primary")

        if submitted:

            final_cv_path = current_cv_path
            if new_cv:
                cv_dir = os.path.join(BASE_DIR, 'data', 'uploaded_cvs')
                os.makedirs(cv_dir, exist_ok=True)
                file_ext = os.path.splitext(new_cv.name)[1]
  
                file_name = f"{emp_code}_{name.replace(' ', '_')}{file_ext}"
                save_path = os.path.join(cv_dir, file_name)
                with open(save_path, "wb") as f:
                    f.write(new_cv.getbuffer())
                final_cv_path = os.path.join("uploaded_cvs", file_name)

            # Prepare updates dict
            updates = {
                "name": name, "email": email, "phone": phone, "location": location, "dob": dob,
                "emergency": emergency, "pf": pf, "mediclaim": mediclaim,
                "doj": doj, "team": team, "role": role, "manager": report_mgr,
                "type": etype, "status": status,
                "train_assign": train_assign, "hr_status": hr_stat, "hr_followup": hr_follow,
                "skill1": skill1, "skill2": skill2, "exyears": exyears, "last_contact": last_contact,
                "assetid": assetid, "issue_date": issue_date, "return_date": return_date,
                "adv_sal": adv_sal, "leave_adj": leave_adj, "lap_ret": lap_ret=='Yes', "bag_ret": bag_ret=='Yes',
                "rem_med": rem_med, "rem_pf": rem_pf, "email_rem": email_rem, "grp_rem": grp_rem,
                "letter_shared": letter_shared,
                "monthly_notes": monthly_notes, "mgr_feed": mgr_feed, "imp_areas": imp_areas, "rewards": rewards,
                "cv_path": final_cv_path
            }
            
            success, msg = update_employee_details(emp_code, updates)
            if success:
                st.cache_data.clear()
                st.success(msg)
                st.session_state['edit_mode'] = False
                st.rerun()
            else:
                st.error(msg)
    
    if st.button("Cancel"):
        st.session_state['edit_mode'] = False
        st.rerun()
