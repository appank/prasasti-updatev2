#!/usr/bin/env python3
"""
Create Admin User for Testing
This script creates an admin user directly in Supabase for testing purposes
"""

import requests
import json
import sys
from datetime import datetime

class AdminUserCreator:
    def __init__(self):
        self.base_url = "https://htasbqlbhbwxxdfxbved.supabase.co"
        self.anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0YXNicWxiaGJ3eHhkZnhidmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDIzOTgsImV4cCI6MjA3MDcxODM5OH0.xukRBZXjN0A7p-4ven1Gk-KK_AwfQAAPkvSz0CNtVho"
        self.headers = {
            'apikey': self.anon_key,
            'Authorization': f'Bearer {self.anon_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }

    def check_profiles_table(self):
        """Check if profiles table exists and what structure it has"""
        try:
            response = requests.get(
                f"{self.base_url}/rest/v1/profiles?limit=1",
                headers=self.headers,
                timeout=10
            )
            print(f"Profiles table check status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Profiles table exists, sample data: {data}")
                return True
            else:
                print(f"Profiles table response: {response.text}")
                return False
        except Exception as e:
            print(f"Error checking profiles table: {e}")
            return False

    def create_profile_entry(self, user_id, email):
        """Create a profile entry with admin role"""
        try:
            profile_data = {
                "id": user_id,
                "email": email,
                "role": "admin",
                "created_at": datetime.now().isoformat()
            }
            
            response = requests.post(
                f"{self.base_url}/rest/v1/profiles",
                headers=self.headers,
                json=profile_data,
                timeout=10
            )
            
            if response.status_code == 201:
                print(f"✅ Profile created successfully: {response.json()}")
                return True
            else:
                print(f"❌ Profile creation failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error creating profile: {e}")
            return False

    def check_existing_admin(self):
        """Check if there are any existing admin users"""
        try:
            response = requests.get(
                f"{self.base_url}/rest/v1/profiles?role=eq.admin",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                admins = response.json()
                print(f"Found {len(admins)} existing admin users")
                for admin in admins:
                    print(f"  - Admin: {admin.get('email', 'N/A')} (ID: {admin.get('id', 'N/A')})")
                return admins
            else:
                print(f"Error checking existing admins: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"Error checking existing admins: {e}")
            return []

    def create_test_admin(self):
        """Create a test admin user entry in profiles table"""
        print("🔍 Creating test admin user...")
        
        # Check profiles table first
        if not self.check_profiles_table():
            print("❌ Cannot access profiles table")
            return False
        
        # Check existing admins
        existing_admins = self.check_existing_admin()
        
        if len(existing_admins) > 0:
            print("✅ Admin users already exist, using existing admin for testing")
            return True
        
        # Create a test admin profile entry
        # Note: In a real scenario, this would be done after user registration
        # For testing, we'll create a profile entry with a mock user ID
        test_user_id = "test-admin-user-id-12345"
        test_email = "testadmin@example.com"
        
        return self.create_profile_entry(test_user_id, test_email)

def main():
    creator = AdminUserCreator()
    success = creator.create_test_admin()
    
    if success:
        print("\n✅ Admin user setup completed successfully!")
        print("You can now test the admin dashboard functionality.")
        return 0
    else:
        print("\n❌ Failed to set up admin user.")
        return 1

if __name__ == "__main__":
    sys.exit(main())