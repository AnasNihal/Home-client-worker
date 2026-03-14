#!/usr/bin/env python
"""
Debug script to check user registration
Run this to test user registration and verify roles
"""

import os
import sys
import django

# Setup Django
sys.path.append('/Users/ahmmedanasnihal/Documents/Projects/Home-Service/back-end')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'HomeService.settings')
django.setup()

from django.contrib.auth import get_user_model
from HomeApp.serializers import UserRegistrationSerializer

User = get_user_model()

def test_user_registration():
    print("=== Testing User Registration ===")
    
    # Test data
    test_data = {
        'username': 'testuser123',
        'password': 'testpass123',
        'email': 'test@example.com',
        'phone': '1234567890',
        'address': 'Test Address'
    }
    
    # Create serializer
    serializer = UserRegistrationSerializer(data=test_data)
    
    if serializer.is_valid():
        print("✅ Serializer validation passed")
        user = serializer.save()
        
        print(f"Created user:")
        print(f"  Username: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Role: {user.role}")
        print(f"  Is Superuser: {user.is_superuser}")
        print(f"  Is Staff: {user.is_staff}")
        print(f"  Is Active: {user.is_active}")
        
        # Check if user exists in database
        db_user = User.objects.get(username='testuser123')
        print(f"\nDatabase check:")
        print(f"  DB Role: {db_user.role}")
        print(f"  DB Is Superuser: {db_user.is_superuser}")
        
        # Clean up
        user.delete()
        print("\n✅ Test user deleted")
        
    else:
        print("❌ Serializer validation failed:")
        print(serializer.errors)

def check_existing_users():
    print("\n=== Checking Existing Users ===")
    
    users = User.objects.all()
    for user in users:
        print(f"User: {user.username}")
        print(f"  Role: {user.role}")
        print(f"  Is Superuser: {user.is_superuser}")
        print(f"  Is Staff: {user.is_staff}")
        print("---")

if __name__ == '__main__':
    test_user_registration()
    check_existing_users()
