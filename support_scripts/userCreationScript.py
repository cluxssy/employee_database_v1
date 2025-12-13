import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.auth import create_user


def create_new_user():
    print("\n--- Create New User ---")
    
    username = input("Enter Username: ")
    password = input("Enter Password: ")
    
    print("\nSelect Role:")
    print("1) Admin")
    print("2) HR")
    print("3) Management")
    
    choice = input("Enter choice (1-3): ")
    
    role = None
    if choice == "1":
        role = "Admin"
    elif choice == "2":
        role = "HR"
    elif choice == "3":
        role = "Management"
    else:
        print("Invalid Choice! Exiting.")
        return

    print(f"\nCreating User '{username}' with role '{role}'...")
    success = create_user(username, password, role)
    
    if success:
        print(f"success! User '{username}' created.")
    else:
        print(f"Failed to create user. Username '{username}' might already exist.")

if __name__ == "__main__":
    create_new_user()