import streamlit as st
import sqlite3
import os

# --- DATABASE CONNECTION ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'data', 'employee.db')

from frontend.views.edit_employee import render_edit_form

def get_full_employee_details(emp_code):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    details = {}
    tables = ['employees', 'skill_matrix', 'assets', 'hr_activity', 'performance']
    
    for table in tables:
        try:
            c.execute(f"SELECT * FROM {table} WHERE employee_code = ?", (emp_code,))
            row = c.fetchone()
            details[table] = dict(row) if row else {}
        except Exception as e:
            details[table] = {}
            print(f"Error fetching {table}: {e}")
            
    conn.close()
    return details

@st.dialog("Employee Profile", width="large")
def view_employee_profile(emp_code):
    # Initialize session state for edit mode
    if 'edit_mode' not in st.session_state:
        st.session_state['edit_mode'] = False
    
    # Initialize session state for CV Viewer
    if 'show_cv_pdf' not in st.session_state:
        st.session_state['show_cv_pdf'] = False
        st.session_state['cv_pdf_data'] = None

    # cv viewer full screen config
    if st.session_state['show_cv_pdf'] and st.session_state['cv_pdf_data']:
        st.button("🔙 Back to Profile", on_click=lambda: st.session_state.update({'show_cv_pdf': False}))
        
        pdf_data = st.session_state['cv_pdf_data']
        import base64
        base64_pdf = base64.b64encode(pdf_data).decode('utf-8')
        pdf_display = f'<iframe src="data:application/pdf;base64,{base64_pdf}" width="100%" height="800" type="application/pdf"></iframe>'
        st.markdown(pdf_display, unsafe_allow_html=True)
        return

    data = get_full_employee_details(emp_code)
    emp = data.get('employees', {})
    skills = data.get('skill_matrix', {})
    assets = data.get('assets', {})
    hr = data.get('hr_activity', {})
    perf = data.get('performance', {})
    
    if not emp:
        st.error("Employee details not found.")
        return

    # view mode
    if not st.session_state['edit_mode']:
        # Header
        c1, c2, c3 = st.columns([1, 3, 1])
        with c1:
            photo_rel = emp.get('photo_path')
            photo_shown = False
            if photo_rel:
                full_photo_path = os.path.join(BASE_DIR, 'data', photo_rel)
                if os.path.exists(full_photo_path):
                    st.image(full_photo_path, width=120)
                    photo_shown = True
            
            if not photo_shown:
                st.image("frontend/assets/default_avatar_boy.jpeg", width=120)
        with c2:
            st.subheader(f"{emp.get('name', 'N/A')}")
            st.write(f"**{emp.get('designation', 'N/A')}** | {emp.get('team', 'N/A')}")
            st.caption(f"Code: {emp.get('employee_code')} | Status: {emp.get('employment_status')}")
        with c3:
            if st.session_state.get('user_role') in ['Admin', 'HR']:
                if st.button("✏️ Edit All", key="edit_btn"):
                    st.session_state['edit_mode'] = True
                    st.rerun()

        st.divider()

        # Tabs
        t_pers, t_work, t_skill, t_asset, t_perf = st.tabs([
            "Personal", "Work", "Skills", "Assets", "Performance"
        ])
        
        with t_pers:
            c1, c2 = st.columns(2)
            with c1:
                st.write(f"**Email:** {emp.get('email_id')}")
                st.write(f"**Phone:** {emp.get('contact_number')}")
                st.write(f"**Emergency:** {emp.get('emergency_contact')}")
                st.write(f"**DOB:** {emp.get('dob')}")
            with c2:
                st.write(f"**Location:** {emp.get('location')}")
                st.write(f"**Mediclaim:** {emp.get('mediclaim_included')}")
                st.write(f"**PF Included:** {emp.get('pf_included')}")
                
                # CV Viewer & Download
                cv_rel_path = emp.get('cv_path') or skills.get('cv_upload')
                if cv_rel_path:
                    full_cv_path = os.path.join(BASE_DIR, 'data', cv_rel_path)
                    if os.path.exists(full_cv_path):
                        with open(full_cv_path, "rb") as f:
                            pdf_data = f.read()
                        
                        # Download Button
                        c_cv1, c_cv2 = st.columns(2)
                        with c_cv1:
                             st.download_button("📥 Download", pdf_data, os.path.basename(full_cv_path), "application/pdf")
                        with c_cv2:
                             if st.button("👁️ View CV"):
                                 if full_cv_path.lower().endswith('.pdf'):
                                     st.session_state['show_cv_pdf'] = True
                                     st.session_state['cv_pdf_data'] = pdf_data
                                     st.rerun()
                                 else:
                                     st.warning("Preview only available for PDF.")
                    else:
                        st.warning(f"File missing: {cv_rel_path}")
                else:
                    st.info("No CV uploaded.")

        with t_work:
            c1, c2 = st.columns(2)
            with c1:
                st.write(f"**DOJ:** {emp.get('doj')}")
                st.write(f"**Manager:** {emp.get('reporting_manager')}")
                st.write(f"**Emp Type:** {emp.get('employment_type')}")
            with c2:
                st.write(f"**Training:** {hr.get('training_assigned', 'N/A')}")
                st.write(f"**HR Status:** {hr.get('status', 'N/A')}")
                st.write(f"**Last Follow-up:** {hr.get('last_follow_up', 'N/A')}")

        with t_skill:
            st.write(f"**Primary:** {skills.get('primary_skillset', 'N/A')}")
            st.write(f"**Secondary:** {skills.get('secondary_skillset', 'N/A')}")
            st.write(f"**Experience:** {skills.get('experience_years', 'N/A')} Years")
            st.write(f"**Last Contact:** {skills.get('last_contact_date', 'N/A')}")

        with t_asset:
            c1, c2 = st.columns(2)
            with c1:
                st.write(f"**Asset ID:** {assets.get('asset_id', 'N/A')}")
                st.write(f"**Issued To:** {assets.get('issued_to', 'N/A')}")
                st.write(f"**Issue Date:** {assets.get('issue_date', 'N/A')}")
                st.write(f"**Return Date:** {assets.get('return_date', 'N/A')}")
            with c2:
                st.write(f"**Laptop Returned:** {assets.get('laptop_returned')}")
                st.write(f"**Bag Returned:** {assets.get('laptop_bag_returned')}")
                st.write(f"**Adv. Salary Adj:** {assets.get('advance_salary_adjustment')}")
                st.write(f"**Leave Adj:** {assets.get('leave_adjustment')}")
            
            st.caption("Checklist:")
            st.checkbox("Medical Removed", value=bool(assets.get('remove_from_medical')), disabled=True)
            st.checkbox("PF Removed", value=bool(assets.get('remove_from_pf')), disabled=True)
            st.checkbox("Email Removed", value=bool(assets.get('email_access_removed')), disabled=True)
            st.checkbox("Groups Removed", value=bool(assets.get('removed_from_groups')), disabled=True)
            st.checkbox("Relieving Letter Shared", value=bool(assets.get('relieving_letter_shared')), disabled=True)

        with t_perf:
            st.write("**Monthly Notes:**")
            st.info(perf.get('monthly_check_in_notes', 'N/A'))
            st.write("**Manager Feedback:**")
            st.write(perf.get('manager_feedback', 'N/A'))
            st.write("**Improvement Areas:**")
            st.warning(perf.get('improvement_areas', 'N/A'))
            st.write("**Rewards:**")
            st.success(perf.get('recognition_rewards', 'N/A'))

    # edit mode
    else:
        render_edit_form(emp_code, data)
