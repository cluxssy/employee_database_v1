# RBAC Implementation Plan (Status: COMPLETED)

## 1. Goal
Implement Role-Based Access Control (RBAC) to secure the application.
**Scope:** `HR`, `Admin`, `Management`.
**Constraint:** `Management` role is Read-Only for Dashboard, Directory, and Employee Profiles.
**Important:** `Management` has **Global Read Access** (can view ALL employees), not restricted to their specific team.

## 2. Roles Definition
**Roles:** `HR`, `Admin`, `Management`.

### Permissions Matrix

| Feature / Module | Admin | HR | Management |
| :--- | :---: | :---: | :---: |
| **User Management** (Create/Delete Users) | ✅ Modify | ❌ | ❌ |
| **Dashboard** | ✅ View | ✅ View | ✅ View All (Global Config) |
| **Employee Directory** | ✅ Modify | ✅ Modify | 👁 View All (Global) |
| **Employee Profile** | ✅ Modify | ✅ Modify | 👁 View All (Global) |
| **Add/Edit Employee** | ✅ Modify | ✅ Modify | ❌ |
| **Assets** (Module) | ✅ Modify | ✅ Modify | ❌ |
| **Performance** (Module) | ✅ Modify | ✅ Modify | ❌ |
| **Training** (Module) | ✅ Modify | ✅ Modify | ❌ |

## 3. Backend Implementation Steps

### 3.1 Database Schema
*   **Current State:** `users` table check constraint allows `('HR', 'Admin', 'Management')`.
*   [x] **Action:** No schema changes required.

### 3.2 Security Enforcement (API)
*   **Target:** `backend/routers/*.py`
*   [x] **Action:** Apply `require_role` dependency.
    *   **Universal**: All roles can call `GET /auth/me`, `GET /dashboard/stats`.
    *   **Directory (`employees.py`)**:
        *   `GET /employees`: Allow `['Admin', 'HR', 'Management']` (Returns ALL records).
        *   `GET /employees/{id}`: Allow `['Admin', 'HR', 'Management']` (Returns ANY record).
        *   `GET /employees/{id}/*`: Allow `['Admin', 'HR', 'Management']`.
        *   `POST/PUT/DELETE`: Allow `['Admin', 'HR']` ONLY.
    *   **Restricted Modules (`assets`, `performance`, `training`)**:
        *   Allow `['Admin', 'HR']` ONLY.

### 3.3 Enhanced Auth Logic
*   **Target:** `backend/routers/auth.py`
*   [x] **Action:** Ensure `require_role` is robust.

## 4. Frontend Implementation Steps

### 4.1 Global Auth State
*   **Target:** `web/context/AuthContext.tsx`
*   [x] **Action:** Implement `UserContext` to hold generic user data and role.

### 4.2 Navigation & UI Hiding
*   **Target:** `web/components/navBar.tsx`
*   [x] **Action:**
    *   For `Management` users, **HIDE** links to: "Add Employee", "Assets", "Performance", "Training".
    *   **SHOW** links to: "Home" (Dashboard), "Directory".
    *   **Directory View**: Ensure no "Edit/Delete" buttons are shown to `Management`.

### 4.3 Page Protection
*   **Target:** `web/app/*`
*   [x] **Action:** Add client-side redirects.
    *   If `role == 'Management'` visits `/add-employee` -> Redirect to `/dashboard`.
    *   If `role == 'Management'` visits `/manage-assets` -> Redirect to `/dashboard`.
    *   And others (`performance`, `training`).

## 5. Execution Order
1.  [x] **Backend Security**: Lock down `employees.py` (Write ops) and other routers.
2.  [x] **Frontend Context**: Build `AuthContext`.
3.  [x] **Frontend Layout**: Update Sidebar to filter menu items.
4.  [x] **Verification**: Confirm `Management` sees all employees but cannot edit.
