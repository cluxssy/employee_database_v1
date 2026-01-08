import sys
import os

# Ensure backend package is in path (Project Root)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.auth_service import AuthService

def create_admin():
    print("--- Create Admin User ---")
    username = input("Enter Username (default: admin): ").strip() or "admin"
    password = input("Enter Password (default: admin123): ").strip() or "admin123"
    
    print(f"\nCreating Admin with username: '{username}' ...")
    
    service = AuthService()
    try:
        # Check if exists first (Service might error or update)
        # Service throws error if exists
        result = service.create_user(username, password, "Admin", employee_code="ADMIN001")
        print(f"Success! {result['message']}")
    except ValueError as e:
        print(f"Error: {e}")
        # Build logic to reset password if they want?
        print("Tip: If the user exists, you might want to manually update the password in DB or delete the user first.")
    except Exception as e:
        print(f"Unexpected Error: {e}")

if __name__ == "__main__":
    create_admin()
