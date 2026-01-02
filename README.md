# EwandzDigital HRMS - Setup & Deployment Guide

This document contains detailed, step-by-step instructions to set up, run, and use the EwandzDigital HR Management System. It is designed for users of all technical levels to easily get the application running.

## 🌟 Overview
The system consists of two main parts that must run simultaneously:
1.  **Backend (API)**: Handles the database and logic (powered by Python/FastAPI).
2.  **Frontend (Web Interface)**: The visible website you interact with (powered by Next.js).

---

## 📋 Prerequisites
Before you start, please ensure you have the following installed.

### 1. Python (for Backend)
*   **Download**: [python.org/downloads](https://www.python.org/downloads/)
*   **Version**: 3.8 or higher.
*   *Note during installation*: Ensure you check the box **"Add Python to PATH"**.

### 2. Node.js (for Frontend)
*   **Download**: [nodejs.org/en/download](https://nodejs.org/en/download/)
*   **Version**: v18.17.0 or higher (LTS recommended).
*   *Verification*: Open your terminal/command prompt and type `node -v`. It should show a version number.

---

## ⚙️ Installation Guide

**Important**: You will need to use a **Terminal** (Mac/Linux) or **Command Prompt/PowerShell** (Windows).

### Step 1: Download the Project
1.  Open your Terminal or Command Prompt.
2.  Run the following command to clone the repository:
    ```bash
    git clone https://github.com/cluxssy/employee_database_v1.git
    ```
3.  Navigate into the project folder:
    ```bash
    cd employee_database_v1
    ```
    *(Note: If the folder name is different after cloning, just type `cd` and the first few letters of the folder, then press **Tab** to autocomplete).*

### Step 2: Backend Setup (Database & API)
This step checks the database and installs necessary Python libraries.

1.  **Create a Virtual Environment** (Recommended to investigate issues):
    *   **Mac/Linux**:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
    *   **Windows**:
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```
    *(You should see `(venv)` appear at the start of your command line)*.

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Initialize the Database**:
    This creates the `employee.db` file where all data will be stored.
    ```bash
    python backend/database/init_db.py
    ```
    *You should see a message: "Tables created successfully!"*

4.  **Create an Admin Account**:
    Since this is a fresh database, you need to create your first login user.
    ```bash
    python backend/database/create_admin.py
    ```
    *   Enter a **Username** (e.g., `admin`)
    *   Enter a **Password** (e.g., `admin123`)
    *   *Remember these credentials! You will need them to log in.*

---

### Step 3: Frontend Setup (Web Interface)

1.  Open a **NEW** Terminal window (keep the first one open).
2.  Navigate to the `web` folder inside the project:
    ```bash
    cd web
    ```
    *(If you are in the root folder, type `cd web`. If you are opening a fresh terminal, navigate to the project folder first, then `cd web`)*.

3.  **Install Node Modules**:
    ```bash
    npm install
    ```
    *This may take a minute as it downloads the interface libraries.*

---

## 🚀 Running the Application

To use the app, **BOTH** the Backend and Frontend must be running.

### 1. Start the Backend
In your **first** terminal (the one in the root folder):
```bash
uvicorn backend.main:app --reload
```
*   You will see specific logs saying `Application startup complete`.
*   The Backend is now running at `http://localhost:8000`.

### 2. Start the Frontend
In your **second** terminal (the one in the `web` folder):
```bash
npm run dev
```
*   You will see a message saying `Ready in ...`.
*   The Frontend is now running at `http://localhost:3000`.

---

## 🖥️ How to Use

1.  Open your web browser (Chrome, Edge, Safari).
2.  Go to: **[http://localhost:3000](http://localhost:3000)**
3.  You will see the Login Screen.
4.  Enter the **Username** and **Password** you created in Step 2.4.
5.  Click **Login**.

### Navigate the App:
*   **Dashboard**: View overview stats.
*   **Employees**: Click "Add Employee" to onboard someone or use the Search bar to find existing records.
*   **Admin**: Go to the Admin panel to create more users (HR, Managers) if needed.

---

## ❓ Troubleshooting

**Q: "Command not found" error?**
*   Ensure Python and Node.js are installed and added to your system PATH.
*   Try closing and reopening the terminal.

**Q: Backend says "Module not found"?**
*   Ensure you activated the virtual environment (`source venv/bin/activate` or `venv\Scripts\activate`) before running `uvicorn`.

**Q: Frontend says "EADDRINUSE"?**
*   Something is already running on port 3000. Try stopping other tasks or restarting your computer.

**Q: I can't log in?**
*   Ensure you ran the `create_admin.py` script.
*   Ensure the Backend terminal is still running (don't close it!).
*   Check the backend terminal for any error messages when you click Login.

---

## 📂 Project Structure for Developers

*   **`backend/`**: Python FastAPI application (Logic & API).
*   **`web/`**: Next.js React application (UI & Pages).
*   **`data/`**: Stores the SQLite database file (`employee.db`) and uploaded CVs.
