import streamlit as st
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from backend.auth import verify_user

# Import Views
from frontend.views.dashboard import show_dashboard
from frontend.views.employee_list import show_employee_list
from frontend.views.add_employee import show_add_employee

# page config
st.set_page_config(
    page_title="EwandzDigital HRMS",
    page_icon="frontend/assets/icon.jpeg",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.logo("frontend/assets/logo.png")

# session state
if 'user_role' not in st.session_state:
    st.session_state['user_role'] = None

# login view function
def show_login():
    st.title("Login")
    c1, c2, c3 = st.columns([1, 2, 1])
    with c2:
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        
        if st.button("Login", type="primary"):
            valid, role = verify_user(username, password)
            if valid:
                st.session_state['user_role'] = role
                st.session_state['username'] = username
                st.success(f"Welcome, {username}!")
                st.rerun()
            else:
                st.error("Invalid Username or Password")

# logout function
def logout():
    st.session_state['user_role'] = None
    st.session_state['username'] = None

# define all pages
login_page = st.Page(show_login, title="Login")
dashboard_page = st.Page(show_dashboard, title="Dashboard", default=True)
employee_list_page = st.Page(show_employee_list, title="Employee List")
add_employee_page = st.Page(show_add_employee, title="Add Employee")

# navigation logic
if st.session_state['user_role'] is None:
    pg = st.navigation([login_page])
else:
    # If Logged In,
    pages = [dashboard_page, employee_list_page]
    
    if st.session_state['user_role'] in ['Admin', 'HR']:
        pages.append(add_employee_page)
        
    pg = st.navigation(pages)
    
    # user info in sidebar
    st.sidebar.write(f"**{st.session_state['username']}**")
    st.sidebar.button("Logout", on_click=logout)


pg.run()