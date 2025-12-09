import streamlit as st
import pandas as pd
import sqlite3
import plotly.express as px
import os

# Set page config
st.set_page_config(page_title="Dashboard", page_icon="frontend/assets/icon.jpeg", layout="wide")

st.logo("frontend/assets/logo.png")

# Connect to DB
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'data', 'employee.db')

@st.cache_data
def load_data():
    conn = sqlite3.connect(DB_PATH)
    
    # Load all tables we need
    df_emp = pd.read_sql("SELECT * FROM employees", conn)
    df_skills = pd.read_sql("SELECT * FROM skill_matrix", conn)
    df_assets = pd.read_sql("SELECT * FROM assets", conn)
    
    conn.close()
    return df_emp, df_skills, df_assets

try:
    df, df_skills, df_assets = load_data()

    st.title("HR Dashboard")
    
    # Top Row: KPI Cards
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Employees", len(df))
    
    with col2:
        active_count = len(df[df['employment_status'] == 'Active'])
        st.metric("Active", active_count, delta="HEADCOUNT")
        
    with col3:
        exited_count = len(df[df['employment_status'] == 'Exited'])
        st.metric("Exited", exited_count, delta="-ATTRITION", delta_color="inverse")

    with col4:
        # Just a dummy metric for now
        st.metric("Departments", df['team'].nunique())

    # Create Tabs for better organization
    tab_overview, tab_talent, tab_ops, tab_hiring = st.tabs(["📊 Overview", "🧠 Talent", "⚙️ Operations", "🚀 Hiring"])

    with tab_overview:
        c1, c2 = st.columns(2)
        with c1:
            st.subheader("Headcount by Department")
            dept_counts = df['team'].value_counts().reset_index()
            dept_counts.columns = ['Team', 'Count']
            fig_dept = px.bar(dept_counts, x='Team', y='Count', color='Team', text_auto=True)
            st.plotly_chart(fig_dept, use_container_width=True)

        with c2:
            st.subheader("Employment Status")
            status_counts = df['employment_status'].value_counts().reset_index()
            status_counts.columns = ['Status', 'Count']
            fig_status = px.pie(status_counts, values='Count', names='Status', hole=0.4, color='Status', color_discrete_map={'Active':'#00CC96', 'Exited':'#EF553B'})
            st.plotly_chart(fig_status, use_container_width=True)

    with tab_talent:
        t1, t2 = st.columns(2)
        with t1:
            st.subheader("Top Technical Skills")
            skill_counts = df_skills['primary_skillset'].value_counts().reset_index().head(7)
            skill_counts.columns = ['Skill', 'Count']
            fig_skills = px.bar(skill_counts, x='Count', y='Skill', orientation='h', text_auto=True, color='Count', color_continuous_scale='Viridis')
            st.plotly_chart(fig_skills, use_container_width=True)

        with t2:
            st.subheader("Experience Distribution")
            fig_exp = px.histogram(df_skills, x="experience_years", nbins=10, title="Years of Experience", color_discrete_sequence=['#AB63FA'])
            st.plotly_chart(fig_exp, use_container_width=True)

    with tab_ops:
        o1, o2 = st.columns(2)
        with o1:
            st.subheader("Average Tenure")
            # Calculate Tenure
            df['doj'] = pd.to_datetime(df['doj'], errors='coerce')
            now = pd.Timestamp.now()
            df['tenure_days'] = (now - df['doj']).dt.days
            avg_tenure = round(df[df['employment_status']=='Active']['tenure_days'].mean() / 365, 1)
            
            st.metric(label="Avg Tenure (Years)", value=f"{avg_tenure}")
            
            fig_tenure = px.histogram(df[df['employment_status']=='Active'], x="tenure_days", title="Tenure Distribution (Days)")
            st.plotly_chart(fig_tenure, use_container_width=True)

        with o2:
            st.subheader("Asset Inventory")
            asset_status = df_assets['laptop_returned'].apply(lambda x: "Returned" if x == 1 else "Assigned").value_counts().reset_index()
            asset_status.columns = ['Status', 'Count']
            fig_assets = px.pie(asset_status, values='Count', names='Status', hole=0.6, color_discrete_sequence=['#EF553B', '#00CC96'])
            st.plotly_chart(fig_assets, use_container_width=True)

    with tab_hiring:
        h1, h2 = st.columns(2)
        with h1:
            st.subheader("Hiring Trend (Yearly)")
            df['Year'] = df['doj'].dt.year
            hiring_trend = df.groupby('Year').size().reset_index(name='Hires')
            fig_trend = px.line(hiring_trend, x='Year', y='Hires', markers=True, line_shape='spline')
            st.plotly_chart(fig_trend, use_container_width=True)

        with h2:
            st.subheader("Location Distribution")
            loc_counts = df['location'].value_counts().reset_index()
            loc_counts.columns = ['Location', 'Count']
            fig_loc = px.bar(loc_counts, x='Count', y='Location', orientation='h', text_auto=True, color='Count')
            st.plotly_chart(fig_loc, use_container_width=True)
            
        st.divider()
        st.subheader("🆕 Recent Hires")
        recent_hires = df.sort_values(by='doj', ascending=False).head(5)
        st.dataframe(
            recent_hires[['name', 'team', 'designation', 'doj', 'location']],
            use_container_width=True,
            hide_index=True 
        )

except Exception as e:
    st.error(f"Error loading data: {e}")
