from backend.auth import create_user, get_all_users

def bootstrap():
    print("Bootstrapping Admin User...")
    
    # Check if exists
    users = get_all_users()
    for u in users:
        if u['username'] == 'admin':
            print("User 'admin' already exists.")
            return

    # Create
    success = create_user('admin', 'admin123', 'Admin')
    if success:
        print("Successfully created user 'admin' with password 'admin123'")
    else:
        print("Failed to create admin user.")

if __name__ == "__main__":
    bootstrap()
