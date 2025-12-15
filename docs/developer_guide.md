# Developer Guide 👨‍💻

This comprehensive document serves as the technical reference for the **EwandzDigital HRMS** application. It covers architecture, database schema, code structure, auth flow, and extensibility.

---

## 1. System Architecture

The application is built using a **Monolithic** architecture pattern, primarily leveraging **Streamlit** for both frontend rendering and backend logic execution, backed by a local **SQLite** database.

### High-Level Design
*   **Frontend**: Streamlit (Python-based reactive UI framework).
*   **Backend Logic**: Direct Python functions embedded within Views or separated into utility modules.
*   **Data Layer**: SQLite Database (`employee.db`) queried via Python's `sqlite3` library.
*   **File Storage**: 
    *   Database file: `data/employee.db`
    *   CV Documents: `data/uploaded_cvs/`

### directory Structure
```text
ewandzdigital/
├── backend/
│   ├── auth.py              # User authentication (Verify, Create, Delete, Update Password)
│   └── database/
│       └── init_db.py       # SQL scripts to initialize schema and tables
├── frontend/
│   ├── app.py               # MAIN ENTRY POINT (Page Routing, Sidebar, Auth Check)
│   ├── assets/              # Static assets (images, icons)
│   └── views/               # Functional modules (Pages)
│       ├── dashboard.py     # Analytics & KPI Visualization
│       ├── add_employee.py  # Form for adding new records
│       ├── employee_list.py # Searchable table listing
│       ├── profile_view.py  # Read-Only Profile View + CV Viewer Logic
│       ├── edit_employee.py # Edit Form Logic & Update Queries
│       └── manage_users.py  # Admin-only user management
├── data/
│   ├── employee.db          # The SQLite Database File
│   └── uploaded_cvs/        # Directory where uploaded CVs are saved
└── requirements.txt         # Python dependencies
```

---

## 2. Database Schema

The database consists of **6 Relational Tables**. The primary linking key is **`employee_code`**.
Check the [Database Guide](docs/database_guide.md) for more details.



## 3. Core Modules & Logic

### Authentication (`backend/auth.py`)
*   **Library**: `passlib.hash.pbkdf2_sha256` for hashing.
*   **Workflow**:
    *   `verify_user(username, password)`: Fetches hash from DB, verifies against input. Returns `(True, Role)` if valid.
    *   `create_user(username, password, role)`: Hashes password, inserts new row.
    *   `delete_user(username)`: Removes row from `users`.

### Application Routing (`frontend/app.py`)
*   Uses `st.session_state` to track:
    *   `user_role`: Determining which pages are added to `st.navigation`.
    *   `username`: current logged-in user.
*   **Logic**:
    *   If `user_role` is None -> Show Login Page.
    *   If Logged In -> Show Dashboard, Employee List.
    *   If `HR` or `Admin` -> Add Employee Page.
    *   If `Admin` -> Add Manage Users Page.

### Adding Employees (`frontend/views/add_employee.py`)
*   **Transactional Integrity**: The form collects data for all 5 tables (Employees, Skills, Assets, HR, Performance).
*   **Execution**: On Submit, it executes 5 sequential `INSERT` statements within a single connection context.
*   **CV Handling**: Files are saved to `data/uploaded_cvs/[EmpCode]_[Name].pdf` and the path is stored in both `employees` and `skill_matrix` tables.

### Editing Employees (`frontend/views/edit_employee.py` & `profile_view.py`)
*   **Separation of Concerns**:
    *   `profile_view.py`: Displays data (Read-Only). Handles the **Edit Button** visibility based on Role.
    *   `edit_employee.py`: Contains `render_edit_form()`. Pre-fills inputs with existing DB data.
*   **Update Logic**:
    *   Constructs a massive `dictionary` of updates from the form state.
    *   Calls `update_employee_details()` which executes 5 `UPDATE` SQL statements.
    *   **CV Persistence**: Checks if a new file is uploaded. If `None`, it sends the *existing* path back to the DB to prevent overwriting with NULL.

### CV Viewer implementation
*   **Feature**: Embedded PDF viewing without download.
*   **Implementation**:
    *   Reads PDF binary.
    *   Encodes to Base64.
    *   Injects an HTML `<iframe>` with `src="data:application/pdf;base64,..."`.
    *   **State Management**: Toggles a "Fullscreen Mode" boolean in Session State to hide other UI elements while viewing.

---

## 4. Setup & Deployment

### Prerequisites
*   Python 3.9+
*   Pip (Python Package Manager)

### Environment Variables
Currently, no external APIs or secrets are used. The database is file-based local storage.

### Installation Steps
1.  **Clone Repository**:
    ```bash
    git clone [repo_url]
    cd ewandzdigital
    ```
2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Initialize Database**:
    This script creates the `data/` directory and all tables.
    ```bash
    python backend/database/init_db.py
    ```
4.  **Run Application**:
    ```bash
    streamlit run frontend/app.py
    ```

---

## 5. Troubleshooting Common Issues

### "Database is locked"
*   **Cause**: Concurrent writes or an unclosed connection in code.
*   **Fix**: Ensure `conn.close()` is always called in `finally` blocks (already implemented in View logic).

### "StreamlitAPIException: Nested Dialogs"
*   **Cause**: Calling a function decorated with `@st.dialog` from within another dialog.
*   **Solution**: Use conditional rendering (state variables) to swap content within the *same* dialog instead of opening a new one. (Implemented in Profile View for CVs).

### "15 values for 14 columns"
*   **Cause**: SQL `INSERT` statement has more placeholders `?` than targeted columns.
*   **Fix**: Check `frontend/views/add_employee.py` and ensure the column list matches the values tuple exactly.

---

## 6. Future Extensibility

*   **Bulk Upload**: To be implemented in `add_employee.py`. Logic should use `pandas.read_excel` to parse rows and iterate through `add_employee_record` logic.
*   **API Layer**: Move SQL logic from Views to `backend/api/` for better testing and separation.
*   **Cloud Storage**: Replace local file system logic for CVs with S3/GCS buckets if deploying to cloud.
