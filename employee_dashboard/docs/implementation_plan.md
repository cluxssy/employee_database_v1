# Employee Database & Dashboard Implementation Plan

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

## 3. Data Schema Design

### Table: `employees` (Active & Exited)
*Combines 'Active Employees' and 'Exited Employees' sheets.*
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key (S. No) |
| `employee_code` | String | Unique Employee ID |
| `name` | String | Full Name |
| `dob` | Date | Date of Birth |
| `contact_number` | String | Phone Number |
| `emergency_contact` | String | Emergency Phone |
| `email_id` | String | Email Address |
| `doj` | Date | Date of Joining |
| `team` | String | Department/Team |
| `designation` | String | Job Title |
| `employment_type` | String | Full-time/Contract/Intern |
| `reporting_manager` | String | Manager Name |
| `location` | String | Office Location |
| `employment_status` | String | 'Active' or 'Exited' |
| `cv_path` | String | Path to CV File |
| `id_proofs` | String | Path/Details of ID |
| `laptop_details` | String | Asset Information |
| `training_completion` | String | Training Status |
| `notes` | String | Additional Comments |
| `relieving_date` | Date | Date of Exit (from Exited sheet) |
| `clearance_status` | String | Clearance Status (from Exited sheet) |

### Table: `skill_matrix`
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key |
| `candidate_name` | String | Name (Link to Employee?) |
| `primary_skillset` | String | Main Skills |
| `secondary_skillset` | String | Other Skills |
| `experience_years` | Float | Years of Experience |
| `last_contact_date` | Date | Last Contacted |
| `cv_upload` | String | Path to CV |

### Table: `assets`
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key |
| `employee_id` | String | Link to Employee Code |
| `asset_id` | String | Unique Asset ID |
| `issued_to` | String | Employee Name |
| `issue_date` | Date | Date Issued |
| `return_date` | Date | Date Returned |
| `laptop_returned` | Boolean | Status |
| `laptop_bag_returned` | Boolean | Status |
| `email_access_removed` | Boolean | Exit Checklist |
| `relieving_letter_shared` | Boolean | Exit Checklist |

### Table: `hr_activity`
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key |
| `employee_name` | String | Employee Name |
| `training_assigned` | String | Training Name |
| `status` | String | Completion Status |
| `last_follow_up` | Date | Date |

### Table: `performance`
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Primary Key |
| `employee_name` | String | Employee Name |
| `monthly_check_in_notes` | String | Notes |
| `manager_feedback` | String | Feedback |
| `improvement_areas` | String | Areas to Improve |
| `recognition_rewards` | String | Awards/Recognition |

### Table: `users` (RBAC)
*Unchanged*
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `username` | String | Login ID |
| `password_hash` | String | Hashed Password |
| `role` | String | 'HR', 'Admin', 'Management' |

### Table: `users` (RBAC)
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `username` | String | Login ID |
| `password_hash` | String | Hashed Password |
| `role` | String | 'HR', 'Admin', 'Management' |

## 4. Implementation Phases

### Phase 1: Requirements + DB Setup (Week 1-2)
*Focus: Foundation and Data Structure*
- [x] **Requirement Gathering**: (Completed) Defined objectives and data schema.
- [x] **Project Initialization**: Setup folder structure and `requirements.txt`.
- [ ] **Database Design & Init**:
    - Update `init_db.py` to match the **exact schema** (Employees + Users tables).
    - Create the SQLite database `employee.db`.
- [ ] **Data Preparation**:
    - Create a sample CSV file for testing bulk uploads.
    - Insert initial sample data into the database.
- [ ] **Documentation**: Start the technical documentation.

### Phase 2: UI & Frontend Development (Week 2)
*Focus: Visuals, Layout, and User Experience*
- [ ] **Streamlit Layout Setup**:
    - Configure page config (Title, Icon, Layout).
    - Implement the Sidebar Navigation (Dashboard, Employee List, Upload, CV Viewer).
- [ ] **UI Components Design**:
    - Design **KPI Cards** for the Dashboard (Total, Active, Exited).
    - Design the **Employee Data Table** view.
    - Create the **Upload Form** interface (Single & Bulk widgets).
    - Create the **Login Page** layout.
- [ ] **Styling**:
    - Apply consistent styling (headers, buttons, messages).
    - Ensure a clean, professional look.

### Phase 3: Dashboard Logic & Integration (Week 3)
*Focus: Connecting UI to Database and Implementing Features*
- [ ] **Database Connection**:
    - Connect Python (Streamlit) to the SQLite database.
- [ ] **Authentication Logic**:
    - Implement secure Login/Logout functionality.
    - Enforce **Role-Based Access Control (RBAC)** (Hide/Show pages based on role).
- [ ] **Feature Implementation**:
    - **Dashboard**: Wire up KPI cards and Charts (Plotly) to real DB data.
    - **Search & Filter**: Make the Employee List filters functional.
    - **Bulk Upload**: Implement the logic to parse CSV/Excel and insert into DB.
    - **CV Viewer**: Implement file retrieval and download logic.

### Phase 4: Testing & Deployment (Week 4)
*Focus: Quality Assurance and Final Delivery*
- [ ] **Testing**:
    - **Functional Testing**: Verify all features (Add, Edit, Upload, Search).
    - **Role Testing**: Ensure Managers cannot edit data and HR can.
    - **Data Integrity**: Test upload with invalid data formats.
- [ ] **Enhancements**:
    - Add tooltips, success messages, and error handling.
- [ ] **Final Documentation**:
    - Complete `README.md` with "How to Run" and "User Guide".
- [ ] **Presentation**: Prepare for final demo/handover.
