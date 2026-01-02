# EwandzDigital HRMS (Modern Stack)

A comprehensive, modern Employee Database Management System built with **Next.js** (Frontend) and **FastAPI** (Backend). This application simplifies HR operations by providing a centralized platform for managing employee records, tracking assets, monitoring performance, and visualizing workforce analytics.

## 🚀 Key Features

*   **📊 Interactive Dashboard**: Real-time analytics on headcount, department distribution, attrition, and tenure.
*   **👥 Employee Management**:
    *   **Add Employee**: Comprehensive form to onboard new hires across 5 data dimensions.
    *   **Edit Profile**: Full editing capabilities with tabbed navigation.
    *   **Listing**: Searchable and filterable table of all employees.
*   **📄 CV Management**:
    *   Upload CVs (PDF/Docx) during onboarding or editing.
    *   **In-App PDF Viewer**: View CVs directly within the application.
*   **🔐 Role-Based Access Control (RBAC)**:
    *   **Admin**: Full access + User Management.
    *   **HR**: Full access to employee data (Add/Edit/View).
    *   **Management**: Read-only access to Dashboards and Employee Lists.
    *   **Employee**: Personal profile view.
*   **🛠️ Asset & Performance Tracking**: Dedicated sections for tracking company assets and performance reviews.

## 🛠️ Tech Stack

*   **Frontend**: Next.js 16, React 19, TailwindCSS 4, Framer Motion
*   **Backend**: FastAPI, Uvicorn
*   **Database**: SQLite
*   **Authentication**: Session-based with Cookies

## 📂 Project Structure

```text
ewandzdigital/
├── backend/                # FastAPI Backend
│   ├── database/           # DB scripts & connection
│   ├── routers/            # API endpoints (auth, employees, etc.)
│   ├── main.py             # Entry point
│   └── auth.py             # Authentication logic
├── web/                    # Next.js Frontend
│   ├── app/                # Pages and Layouts
│   ├── components/         # Reusable UI components
│   └── public/             # Static assets
├── data/                   # Database & Uploaded files
│   └── employee.db         # SQLite Database
└── requirements.txt        # Backend dependencies
```

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.8+)

### 2. Installation

#### Backend Setup
1.  Navigate to the root directory.
2.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Initialize the database:
    ```bash
    python backend/database/init_db.py
    ```

#### Frontend Setup
1.  Navigate to the `web` directory:
    ```bash
    cd web
    ```
2.  Install Node dependencies:
    ```bash
    npm install
    ```

### 3. Running the Application

You need to run both the backend and frontend servers.

#### Start Backend (Terminal 1)
From the root `ewandzdigital` directory:
```bash
uvicorn backend.main:app --reload
```
*The API will be available at `http://localhost:8000`*

#### Start Frontend (Terminal 2)
From the `web` directory:
```bash
npm run dev
```
*The Application will be available at `http://localhost:3000`*

## 🔐 Login Credentials

Since the database is local, you will need to create an initial Admin user to log in.

Run the helper script to create credentials:
```bash
python backend/database/create_admin.py
```
Follow the prompts to set a username and password. You can then use these credentials to log in.

Once the backend is running, you can access the interactive API docs at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
