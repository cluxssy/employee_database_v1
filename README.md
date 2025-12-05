# Ewandz Digital HRMS

## 1. Project Overview
Build a centralized employee database using Python (Streamlit + SQLite) to manage active and exited employees. The system will support bulk/single uploads, CV management, and role-based access control (HR, Admin, Management).

## 2. Core Requirements
Based on HR Inputs and Objectives:
*   **Centralized Database**: Unified view of Active and Exited employees.
*   **Data Management**:
    *   **Bulk Upload**: Capability to upload CSV/Excel files for mass data entry.
    *   **Single Upload**: Form to add individual records.
    *   **CV Management**: Upload and view CVs (PDF/Doc) linked to employee profiles.
*   **Search & Filter**:
    *   Filter by: Name, Skills, Experience, Department/Team, Manager, Location.
*   **Role-Based Access Control (RBAC)**:
    *   **Admin (System Owner)**:
        *   *Responsibilities*: Manage user accounts (create/delete logins), reset passwords, full system access.
        *   *Why*: Ensures system security and maintenance.
    *   **HR (Data Owner)**:
        *   *Responsibilities*: Add/Edit employee records, upload CVs, manage bulk uploads, update statuses (Active/Exited).
        *   *Why*: Responsible for data accuracy and daily management.
    *   **Management (Viewer)**:
        *   *Responsibilities*: View dashboards, search for employees/skills, view CVs. Read-only access.
        *   *Why*: Needs insights for decision-making without risk of altering data.

    **Permission Matrix**:
    | Feature | Admin | HR | Management |
    | :--- | :---: | :---: | :---: |
    | View Dashboard | ✅ | ✅ | ✅ |
    | Search Employees | ✅ | ✅ | ✅ |
    | View CVs | ✅ | ✅ | ✅ |
    | Add/Edit Employees | ✅ | ✅ | ❌ |
    | Upload Files | ✅ | ✅ | ❌ |
    | Manage Users | ✅ | ❌ | ❌ |
*   **Dashboard**: Visual KPIs (Headcount, Attrition, Department distribution).

## 3. Tech Stack

*   **Frontend**: Streamlit
*   **Backend**: Python
*   **Database**: SQLite
*   **Visualization**: Plotly
*   **Data Handling**: Pandas, OpenPyXL

## 4. Project Structure

```
ewandzdigital/
├── backend/
│   ├── database/       # Database initialization and connection logic
│   └── api/            # Business logic functions
├── frontend/
│   ├── components/     # Reusable UI widgets
│   └── pages/          # Streamlit page layouts
├── data/               # SQLite database file (employee.db)
├── docs/               # Documentation and guides
└── requirements.txt    # Project dependencies
```

## ⚡ Getting Started

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Initialize Database**:
    ```bash
    python3 backend/database/init_db.py
    ```

## 5. Documentation

*   [Database Guide](docs/database_guide.md): Detailed schema and table relationships.
*   [Implementation Plan](docs/implementation_plan.md): Project roadmap and phases.
