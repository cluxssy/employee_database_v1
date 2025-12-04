# Database Guide 🗄️

This document provides a comprehensive reference for the **Ewandz Digital HRMS** SQLite database (`employee.db`). It details the schema, relationships, and data types for all tables.

## 🔗 Entity Relationship Diagram (ERD) Concept
The database follows a **Star Schema** design where the `employees` table acts as the central hub.
*   **Central Table**: `employees` (Contains unique `employee_code`)
*   **Related Tables**: `skill_matrix`, `assets`, `hr_activity`, `performance`
*   **Relationship Type**: **One-to-Many** (One Employee can have multiple assets, training records, etc.)
*   **Foreign Key**: All related tables use `employee_code` to link back to the master `employees` record.

---

## 📋 Detailed Table Schema

### 1. `employees` (Master Table)
**Purpose**: Stores the "Single Source of Truth" for every employee, including personal details, current status, and exit information.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | `PRIMARY KEY AUTOINCREMENT` | Internal system ID. |
| `employee_code` | TEXT | `UNIQUE NOT NULL` | **Unique Employee ID** (e.g., EMP001). This is the Foreign Key for all other tables. |
| `name` | TEXT | `NOT NULL` | Full legal name of the employee. |
| `dob` | TEXT | | Date of Birth (YYYY-MM-DD). |
| `contact_number` | TEXT | | Primary mobile number. |
| `emergency_contact` | TEXT | | Emergency contact number. |
| `email_id` | TEXT | | Official company email address. |
| `doj` | TEXT | | Date of Joining (YYYY-MM-DD). |
| `team` | TEXT | | Department or Team (e.g., Engineering, Sales). |
| `designation` | TEXT | | Current Job Title / Role. |
| `employment_type` | TEXT | | Type of employment (Full-time, Contract, Intern). |
| `reporting_manager`| TEXT | | Name of the direct supervisor. |
| `location` | TEXT | | Office location (e.g., Bangalore, Remote). |
| `employment_status`| TEXT | `DEFAULT 'Active'` | Current status: 'Active' or 'Exited'. |
| `cv_path` | TEXT | | File path to the uploaded Resume/CV. |
| `id_proofs` | TEXT | | Details or path to ID proof documents. |
| `laptop_details` | TEXT | | Summary of laptop specs (e.g., "MacBook Pro M1"). |
| `pf_included` | TEXT | | 'Yes' or 'No' flag for Provident Fund. |
| `mediclaim_included` | TEXT | | 'Yes' or 'No' flag for Health Insurance. |
| `training_completion`| TEXT | | Summary status of mandatory training. |
| `notes` | TEXT | | General administrative notes. |
| `exit_date` | TEXT | | Date of Exit (YYYY-MM-DD). Null if Active. |
| `exit_reason` | TEXT | | Reason for leaving. Null if Active. |
| `clearance_status` | TEXT | | Final clearance status (e.g., 'Pending', 'Cleared'). |

### 2. `users` (Authentication)
**Purpose**: Manages system access. Passwords are **never** stored in plain text.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | `PRIMARY KEY AUTOINCREMENT` | Internal User ID. |
| `username` | TEXT | `UNIQUE NOT NULL` | Login username (e.g., 'admin'). |
| `password_hash` | TEXT | `NOT NULL` | PBKDF2 SHA-256 Hashed Password. |
| `role` | TEXT | `CHECK(role IN ('HR', 'Admin', 'Management'))` | Permission level. |

### 3. `skill_matrix`
**Purpose**: Tracks the technical and professional skills of employees.

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | INTEGER | Primary Key. |
| `employee_code` | TEXT | Links to `employees.employee_code`. |
| `candidate_name` | TEXT | Name of the employee (Redundant but useful for quick display). |
| `primary_skillset` | TEXT | Core skills (e.g., Python, React). |
| `secondary_skillset`| TEXT | Additional skills. |
| `experience_years` | REAL | Total relevant experience in years. |
| `last_contact_date` | TEXT | Date of last profile update/contact. |
| `cv_upload` | TEXT | Path to specific skill-related CV version. |

### 4. `assets`
**Purpose**: Inventory management for hardware assigned to employees.

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | INTEGER | Primary Key. |
| `employee_code` | TEXT | Links to `employees.employee_code`. |
| `asset_id` | TEXT | Unique Asset Tag (e.g., AST-101). |
| `issued_to` | TEXT | Employee Name. |
| `issue_date` | TEXT | Date of allocation. |
| `return_date` | TEXT | Date of return (Null if currently assigned). |
| `advance_salary_adjustment` | TEXT | Exit checklist: Any pending salary adjustments. |
| `leave_adjustment` | TEXT | Exit checklist: Pending leave balance adjustments. |
| `laptop_returned` | BOOLEAN | `1` (True) if returned, `0` (False) otherwise. |
| `laptop_bag_returned`| BOOLEAN | `1` (True) if returned, `0` (False) otherwise. |
| `remove_from_medical` | BOOLEAN | Exit checklist: Removed from insurance policy. |
| `remove_from_pf` | BOOLEAN | Exit checklist: PF account closed/transferred. |
| `email_access_removed`| BOOLEAN | Exit checklist: Corporate email deactivated. |
| `removed_from_groups` | BOOLEAN | Exit checklist: Removed from Slack/Teams groups. |
| `relieving_letter_shared`| BOOLEAN | Exit checklist: Final letter issued. |

### 5. `hr_activity`
**Purpose**: Tracks lifecycle events like training, onboarding, and compliance.

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | INTEGER | Primary Key. |
| `employee_code` | TEXT | Links to `employees.employee_code`. |
| `employee_name` | TEXT | Employee Name. |
| `training_assigned`| TEXT | Title of the training program. |
| `status` | TEXT | Current status (e.g., 'Completed', 'Pending'). |
| `last_follow_up` | TEXT | Date of the last reminder sent. |

### 6. `performance`
**Purpose**: Stores continuous feedback and monthly check-in records.

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | INTEGER | Primary Key. |
| `employee_code` | TEXT | Links to `employees.employee_code`. |
| `employee_name` | TEXT | Employee Name. |
| `monthly_check_in_notes` | TEXT | Summary of 1:1 discussions. |
| `manager_feedback` | TEXT | Formal feedback from the reporting manager. |
| `improvement_areas` | TEXT | Identified areas for growth. |
| `recognition_rewards`| TEXT | Details of any awards or kudos received. |

---
