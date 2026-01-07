from fastapi import APIRouter, Depends
from backend.routers.auth import require_role, get_current_user
from backend.database import get_db_connection
import pandas as pd
import json

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"]
)

@router.get("/stats", dependencies=[Depends(require_role(["Admin", "HR", "Management"]))])
def get_dashboard_stats():
    conn = get_db_connection()
    try:
        # Load Dataframes for easier analysis (mimicking the streamlit logic)
        df_emp = pd.read_sql("SELECT * FROM employees", conn)
        df_assets = pd.read_sql("SELECT * FROM assets", conn)
        df_skills = pd.read_sql("SELECT * FROM skill_matrix", conn)
        
        # 1. Basic Counts
        total_employees = len(df_emp)
        active_count = len(df_emp[df_emp['employment_status'] == 'Active'])
        exited_count = len(df_emp[df_emp['employment_status'] == 'Exited'])
        total_teams = df_emp['team'].nunique()
        total_designations = df_emp['designation'].nunique()

        # 2. Department Distribution
        dept_counts = df_emp['team'].value_counts().reset_index()
        dept_counts.columns = ['name', 'value']
        department_distribution = dept_counts.to_dict('records')

        # 3. Employment Status Distribution
        status_counts = df_emp['employment_status'].value_counts().reset_index()
        status_counts.columns = ['name', 'value']
        status_distribution = status_counts.to_dict('records')

        # 4. Hiring Trend (Yearly)
        # Handle Date parsing
        df_emp['doj'] = pd.to_datetime(df_emp['doj'], errors='coerce')
        df_emp['Year'] = df_emp['doj'].dt.year
        hiring_trend_df = df_emp.groupby('Year').size().reset_index(name='Hires')
        hiring_trend_df = hiring_trend_df.sort_values('Year')
        hiring_trend = hiring_trend_df.to_dict('records') # [{'Year': 2023, 'Hires': 5}, ...]

        # 5. Asset Inventory (Using new checklist columns)
        # Category: "Returned" if cl_laptop is 1. "Assigned" if ob_laptop is 1 and cl_laptop is 0.
        # "Unassigned" otherwise (or just ignore for this chart).
        
        def get_asset_status(row):
            if row.get('cl_laptop', 0) == 1:
                return "Returned"
            elif row.get('ob_laptop', 0) == 1:
                return "Assigned"
            else:
                return "None"

        df_assets['status'] = df_assets.apply(get_asset_status, axis=1)
        # Filter out 'None' so the chart only shows relevant data
        asset_counts = df_assets[df_assets['status'] != 'None']['status'].value_counts().reset_index()
        asset_counts.columns = ['name', 'value']
        asset_distribution = asset_counts.to_dict('records')

        # 6. Top Skills (Parsing Skill Matrix)
        # Splitting comma separated primary_skillset
        all_skills = []
        if not df_skills.empty and 'primary_skillset' in df_skills.columns:
            for skills_str in df_skills['primary_skillset'].dropna():
                if skills_str:
                    parts = [s.strip() for s in skills_str.split(',')]
                    all_skills.extend(parts)
        
        skill_counts = pd.Series(all_skills).value_counts().head(7).reset_index()
        skill_counts.columns = ['name', 'value']
        top_skills = skill_counts.to_dict('records')

        # 7. Experience Distribution (from skill_matrix)
        experience_distribution = []
        if not df_skills.empty and 'experience_years' in df_skills.columns:
            # Create bins for histogram: 0-2, 3-5, 6-10, 11-15, 16+
            df_skills['experience_years'] = pd.to_numeric(df_skills['experience_years'], errors='coerce')
            bins = [0, 2, 5, 10, 15, 100]
            labels = ['0-2', '3-5', '6-10', '11-15', '16+']
            df_skills['exp_range'] = pd.cut(df_skills['experience_years'], bins=bins, labels=labels, right=True)
            exp_counts = df_skills['exp_range'].value_counts().sort_index().reset_index()
            exp_counts.columns = ['range', 'count']
            experience_distribution = exp_counts.to_dict('records')

        # 8. Average Tenure & Tenure Distribution
        avg_tenure = 0
        tenure_distribution = []
        if 'doj' in df_emp.columns:
            now = pd.Timestamp.now()
            df_emp['tenure_days'] = (now - df_emp['doj']).dt.days
            active_df = df_emp[df_emp['employment_status'] == 'Active']
            if not active_df.empty:
                avg_tenure = round(active_df['tenure_days'].mean() / 365, 1)
                
                # Create tenure bins (in years): 0-1, 1-2, 2-5, 5+
                active_df['tenure_years'] = active_df['tenure_days'] / 365
                bins = [0, 1, 2, 5, 100]
                labels = ['0-1y', '1-2y', '2-5y', '5y+']
                active_df['tenure_range'] = pd.cut(active_df['tenure_years'], bins=bins, labels=labels, right=True)
                tenure_counts = active_df['tenure_range'].value_counts().sort_index().reset_index()
                tenure_counts.columns = ['range', 'count']
                tenure_distribution = tenure_counts.to_dict('records')

        # 9. Location Distribution
        location_distribution = []
        if 'location' in df_emp.columns:
            loc_counts = df_emp['location'].value_counts().reset_index()
            loc_counts.columns = ['name', 'value']
            location_distribution = loc_counts.to_dict('records')

        # 10. Recent Hires (Top 5)
        recent_hires = []
        if 'doj' in df_emp.columns:
            recent_df = df_emp.sort_values(by='doj', ascending=False).head(5)
            recent_df['doj_str'] = recent_df['doj'].dt.strftime('%Y-%m-%d')
            recent_hires = recent_df[['name', 'team', 'designation', 'doj_str', 'location']].to_dict('records')

        return {
            "counts": {
                "total": total_employees,
                "active": active_count,
                "exited": exited_count,
                "teams": total_teams,
                "designations": total_designations,
                "avg_tenure": avg_tenure
            },
            "charts": {
                "department": department_distribution,
                "status": status_distribution,
                "hiring_trend": hiring_trend,
                "assets": asset_distribution,
                "skills": top_skills,
                "experience": experience_distribution,
                "tenure": tenure_distribution,
                "location": location_distribution
            },
            "recent_hires": recent_hires
        }

    except Exception as e:
        print(f"Admin Dashboard Error: {e}")
        return {"error": str(e)}
    finally:
        conn.close()


@router.get("/employee-stats", dependencies=[Depends(require_role(["Employee", "Admin", "HR", "Management"]))])
def get_employee_dashboard_stats(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        employee_code = current_user.get("employee_code")
        if not employee_code:
            return {"error": "No employee code found for user"}

        # 1. Employee Details
        employee = conn.execute("SELECT * FROM employees WHERE employee_code = ?", (employee_code,)).fetchone()
        employee_data = dict(employee) if employee else {}

        # 2. Performance (KRAs)
        kras = conn.execute("""
            SELECT count(*) as total, 
                   sum(case when status = 'Completed' then 1 else 0 end) as completed
            FROM kra_assignments 
            WHERE employee_code = ?
        """, (employee_code,)).fetchone()
        
        # 3. Training (HR Activity)
        trainings = conn.execute("""
            SELECT count(*) as total,
                   sum(case when training_status = 'Completed' then 1 else 0 end) as completed
            FROM hr_activity
            WHERE employee_code = ?
        """, (employee_code,)).fetchone()
        
        # 4. Assets (Summing checklist items)
        # Note: We only count physical assets for the dashboard stat, not admin checks like email/groups
        asset_row = conn.execute("""
            SELECT 
                ob_laptop + ob_laptop_bag + ob_headphones + ob_mouse + ob_extra_hardware + ob_client_assets as total_assigned
            FROM assets 
            WHERE employee_code = ?
        """, (employee_code,)).fetchone()
        
        asset_count = asset_row['total_assigned'] if asset_row and asset_row['total_assigned'] else 0
        
        # 5. Notifications
        notifications = conn.execute("""
            SELECT * FROM notifications 
            WHERE employee_code = ? 
            ORDER BY created_at DESC 
            LIMIT 5
        """, (employee_code,)).fetchall()
        
        return {
            "employee": {
                "name": employee_data.get("name"),
                "designation": employee_data.get("designation"),
                "team": employee_data.get("team"),
                "location": employee_data.get("location"),
                "doj": employee_data.get("doj")
            },
            "kras": {
                "total": kras["total"] if kras else 0,
                "completed": kras["completed"] if kras and kras["completed"] else 0
            },
            "training": {
                "total": trainings["total"] if trainings else 0,
                "completed": trainings["completed"] if trainings and trainings["completed"] else 0
            },
            "assets": {
                "total": asset_count
            },
            "notifications": [dict(n) for n in notifications]
        }

    except Exception as e:
        print(f"Employee Dashboard Error: {e}")
        return {"error": str(e)}
    finally:
        conn.close()
