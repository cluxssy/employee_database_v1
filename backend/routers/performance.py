from fastapi import APIRouter
from backend.database import get_db_connection
from backend.routers.auth import require_role, get_current_user

router = APIRouter(
    prefix="/api/performance",
    tags=["performance"]
)

# This router previously handled KRA-based performance management.
# It has been deprecated in favor of the Quarterly Assessment module (assessments.py).
# All KRA, Group, and Assignment endpoints have been removed to streamline the system.
