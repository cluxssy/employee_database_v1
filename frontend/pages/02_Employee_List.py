import streamlit as st
import pandas as pd
import sqlite3
import os

st.set_page_config(page_title="Employee List", page_icon="frontend/assets/icon.jpeg", layout="wide")

st.logo("frontend/assets/logo.png")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'data', 'employee.db')

@st.cache_data
def get_employees():
    conn = sqlite3.connect(DB_PATH)
    # Select specific columns to keep the table clean
    query = """
        SELECT employee_code, name, team, designation, 
               reporting_manager, location, employment_status, email_id 
        FROM employees
    """
    df = pd.read_sql(query, conn)
    conn.close()
    return df

st.title("Employee Directory")

try:
    df = get_employees()

    # Search & Filter Section
    col1, col2, col3 = st.columns([2, 1, 1])
    
    with col1:
        search_term = st.text_input("🔍 Search by Name or ID", placeholder="John Doe...")
    
    with col2:
        dept_filter = st.selectbox("Department", ["All"] + list(df['team'].unique()))
    
    with col3:
        status_filter = st.selectbox("Status", ["All", "Active", "Exited"])

    # Apply Filters
    filtered_df = df.copy()

    if search_term:
        filtered_df = filtered_df[
            filtered_df['name'].str.contains(search_term, case=False) | 
            filtered_df['employee_code'].str.contains(search_term, case=False)
        ]

    if dept_filter != "All":
        filtered_df = filtered_df[filtered_df['team'] == dept_filter]

    if status_filter != "All":
        filtered_df = filtered_df[filtered_df['employment_status'] == status_filter]

    # Show Data
    st.dataframe(
        filtered_df,
        use_container_width=True,
        hide_index=True,
        column_config={
            "email_id": st.column_config.LinkColumn("Email"),
            "employment_status": st.column_config.TextColumn(
                "Status",
                help="Current employment status",
                validate="^(Active|Exited)$"
            )
        }
    )
    
    st.caption(f"Showing {len(filtered_df)} employees")

except Exception as e:
    st.error(f"Failed to load data: {e}")
