# EwandzDigital HRMS

A comprehensive Employee Database Management System built with **Streamlit** and **SQLite**. This application simplifies HR operations by providing a centralized platform for managing employee records, tracking assets, monitoring performance, and visualizing workforce analytics.

## 🚀 Key Features

*   **📊 Interactive Dashboard**: Real-time analytics on headcount, department distribution, attrition, and tenure.
*   **👥 Employee Management**:
    *   **Add Employee**: Comprehensive form to onboard new hires across 5 data dimensions (Personal, Work, Skills, Assets, Performance/HR).
    *   **Edit Profile**: Full editing capabilities with tabbed navigation.
    *   **Listing**: Searchable and filterable table of all employees.
*   **📄 CV Management**:
    *   Upload CVs (PDF/Docx) during onboarding or editing.
    *   **In-App PDF Viewer**: View CVs directly within the application without downloading.
    *   Version control logic ensures CVs are preserved during profile updates.
*   **🔐 Role-Based Access Control (RBAC)**:
    *   **Admin**: Full access + User Management (Create/Delete users, Reset passwords).
    *   **HR**: Full access to employee data (Add/Edit/View).
    *   **Management**: Read-only access to Dashboards and Employee Lists.
*   **🛠️ Asset & Performance Tracking**: Dedicated sections for tracking company assets and performance reviews.

## 🛠️ Tech Stack

*   **Frontend**: Streamlit
*   **Backend**: Python, SQLite (Embedded DB)
*   **Data Processing**: Pandas
*   **Authentication**: Custom Role-Based Auth (Hashed passwords)

## 📂 Project Structure

```text
ewandzdigital/
├── backend/
│   ├── auth.py             # Authentication & User Management logic
│   └── database/           # DB initialization scripts
├── frontend/
│   ├── app.py              # Main application entry point
│   ├── assets/             # Images and icons
│   └── views/              # UI Modules
│       ├── dashboard.py    # Analytics Dashboard
│       ├── add_employee.py # Onboarding Form
│       ├── employee_list.py# Search & List View
│       ├── profile_view.py # Detailed Profile & CV Viewer
│       ├── edit_employee.py# Edit Form Logic
│       └── manage_users.py # Admin User Management
├── data/
│   ├── employee.db         # SQLite Database
│   └── uploaded_cvs/       # Stored CV files
├── docs/                   # Documentation
└── requirements.txt        # Dependencies
```

## ⚡ Getting Started

### 1. Prerequisites
Ensure you have Python 3.8+ installed.

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd ewandzdigital
pip install -r requirements.txt
```

### 3. Database Setup
Initialize the database with the schema and default admin user:

```bash
python backend/database/init_db.py
```
*(Default Admin: `admin` / `admin123`)*

### 4. Run the Application
Launch the Streamlit app:

```bash
streamlit run frontend/app.py
```

## 📚 Documentation

*   [**User Manual**](docs/user_manual.md): Guide for HR and Admins on using the system.
*   [**Developer Guide**](docs/developer_guide.md): Technical details, database schema, and code walkthrough.
*   [**Database Guide**](docs/database_guide.md): Detailed schema and table relationships.