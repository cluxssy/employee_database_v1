# Ewandz Digital HRMS

A comprehensive Human Resource Management System designed to streamline employee data management. Built with **Python**, **Streamlit**, and **SQLite**.

## 🚀 Key Features

*   **Centralized Database**: Unified storage for Active and Exited employees.
*   **Interactive Dashboard**: Real-time KPIs for headcount, attrition, and department distribution.
*   **Role-Based Access Control (RBAC)**:
    *   **Admin**: Full system control.
    *   **HR**: Data entry and management.
    *   **Management**: Read-only access to dashboards.
*   **Detailed Profiles**: Track Skills, Assets, HR Activities, and Performance reviews per employee.
*   **Bulk Operations**: Support for Excel/CSV data uploads.

## 🛠️ Tech Stack

*   **Frontend**: Streamlit
*   **Backend**: Python
*   **Database**: SQLite
*   **Visualization**: Plotly
*   **Data Handling**: Pandas, OpenPyXL

## 📂 Project Structure

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

## 📖 Documentation

*   [Database Guide](docs/database_guide.md): Detailed schema and table relationships.
*   [Implementation Plan](docs/implementation_plan.md): Project roadmap and phases.
