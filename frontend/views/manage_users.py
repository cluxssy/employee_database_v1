import streamlit as st
import pandas as pd
from backend.auth import create_user, get_all_users, delete_user, update_password

def show_manage_users():
    # Security Check
    if st.session_state.get('user_role') != 'Admin':
        st.error("Access Denied. You do not have permission to view this page.")
        return

    st.title("Manage Users")
    st.markdown("Create and manage system access accounts.")

    # --- Create New User SECTION ---
    with st.expander("➕ Create New User", expanded=False):
        with st.form("create_user_form"):
            c1, c2, c3 = st.columns(3)
            with c1:
                new_user = st.text_input("Username")
            with c2:
                new_pass = st.text_input("Password", type="password")
            with c3:
                new_role = st.selectbox("Role", ["HR", "Management", "Admin"])
            
            submitted = st.form_submit_button("Create Account")
            if submitted:
                if new_user and new_pass:
                    if create_user(new_user, new_pass, new_role):
                        st.success(f"User '{new_user}' created successfully!")
                        st.rerun()
                    else:
                        st.error("Failed to create user. Username might already exist.")
                else:
                    st.warning("Please fill in all fields.")

    st.divider()

    # --- LIST USERS SECTION ---
    st.subheader("Existing Accounts")
    
    users = get_all_users()
    if not users:
        st.info("No users found.")
    else:
        # Convert to DataFrame for easier display mostly, but we want buttons so iteration is better
        # Let's use a nice grid layout
        
        # Header
        h1, h2, h3, h4 = st.columns([2, 2, 2, 2])
        h1.markdown("**Username**")
        h2.markdown("**Role**")
        h3.markdown("**Actions**")
        h4.markdown("**Password Management**")
        
        st.markdown("---")

        for user_data in users:
            # user_data is a tuple (username, role)
            username = user_data[0]
            role = user_data[1]
            
            c1, c2, c3, c4 = st.columns([2, 2, 2, 2])
            
            with c1:
                st.write(f"👤 {username}")
            with c2:
                st.write(f"`{role}`")
            
            with c3:
                # Delete Button
                if username != st.session_state.get('username'): # Prevent self-deletion
                    if st.button("🗑️ Delete", key=f"del_{username}"):
                        delete_user(username)
                        st.success(f"Deleted {username}")
                        st.rerun()
                else:
                    st.caption("(Current User)")
            
            with c4:
                # Password Reset Popover
                with st.popover("🔑 Change Password"):
                    st.write(f"Update password for **{username}**")
                    new_pw = st.text_input("New Password", type="password", key=f"pw_{username}")
                    if st.button("Update", key=f"upd_{username}"):
                        if new_pw:
                            update_password(username, new_pw)
                            st.success("Password updated!")
                        else:
                            st.warning("Enter a password.")
            
            st.markdown("---")
