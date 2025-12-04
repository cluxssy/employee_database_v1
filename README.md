# Employee Database Project Structure

## Folder Overview

### `backend/`
Contains all logic related to data processing, database interactions, and authentication.
- `database/`: Database initialization scripts and connection logic.
- `api/`: Functions that handle business logic (e.g., `add_employee`, `get_dashboard_stats`).

### `frontend/`
Contains the Streamlit user interface code.
- `components/`: Reusable UI elements (e.g., `sidebar.py`, `login_form.py`).
- `pages/`: Individual page layouts (e.g., `dashboard.py`, `employee_list.py`).
- `app.py`: The main entry point for the Streamlit application.

### `data/`
Stores the actual data files.
- `employee.db`: The SQLite database file.
- `uploaded_cvs/`: Directory where uploaded CV files are saved.

### `docs/`
Project documentation.
- `implementation_plan.md`: The roadmap we are following.
