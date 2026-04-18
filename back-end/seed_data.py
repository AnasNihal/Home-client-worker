#!/usr/bin/env python3
"""
Data seeding script for Home Service application
Creates initial professions and workers
"""

import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'HomeService.settings')
django.setup()

from HomeApp.models import Profession, CustomerUser, UserProfile, Worker, WorkerService

def create_professions():
    """Create initial professions"""
    professions_data = [
        "Plumbing",
        "Electrical", 
        "Carpentry",
        "Painting",
        "Cleaning",
        "Gardening",
        "HVAC",
        "Moving",
        "Appliance Repair",
        "Home Security"
    ]
    
    created_professions = []
    for prof_name in professions_data:
        profession, created = Profession.objects.get_or_create(name=prof_name)
        created_professions.append(profession)
        if created:
            print(f"Created profession: {profession.name}")
        else:
            print(f"Profession already exists: {profession.name}")
    
    return created_professions

def create_workers():
    """Create sample workers with profiles and services"""
    
    # Get professions
    professions = {p.name: p for p in Profession.objects.all()}
    
    workers_data = [
        {
            "username": "john_plumber",
            "email": "john@example.com",
            "phone": "1234567890",
            "address": "123 Main St, City",
            "profession": "Plumbing",
            "experience": "10+ years",
            "hourly_rate": 50.00,
            "services": ["Pipe Repair", "Installation", "Emergency Plumbing"],
            "bio": "Experienced plumber with emergency services available"
        },
        {
            "username": "mary_electrician",
            "email": "mary@example.com",
            "phone": "2345678901",
            "address": "456 Oak Ave, City",
            "profession": "Electrical",
            "experience": "8 years",
            "hourly_rate": 60.00,
            "services": ["Wiring", "Panel Installation", "Lighting"],
            "bio": "Licensed electrician specializing in residential services"
        },
        {
            "username": "bob_carpenter",
            "email": "bob@example.com",
            "phone": "3456789012",
            "address": "789 Pine Rd, City",
            "profession": "Carpentry",
            "experience": "15 years",
            "hourly_rate": 45.00,
            "services": ["Furniture", "Cabinets", "Deck Building"],
            "bio": "Master carpenter with custom woodworking expertise"
        },
        {
            "username": "sarah_painter",
            "email": "sarah@example.com",
            "phone": "4567890123",
            "address": "321 Elm St, City",
            "profession": "Painting",
            "experience": "6 years",
            "hourly_rate": 35.00,
            "services": ["Interior Painting", "Exterior Painting", "Wallpaper"],
            "bio": "Professional painter with attention to detail"
        },
        {
            "username": "mike_cleaner",
            "email": "mike@example.com",
            "phone": "5678901234",
            "address": "654 Maple Dr, City",
            "profession": "Cleaning",
            "experience": "5 years",
            "hourly_rate": 25.00,
            "services": ["Deep Cleaning", "Regular Maintenance", "Office Cleaning"],
            "bio": "Thorough cleaning services for homes and offices"
        }
    ]
    
    for worker_data in workers_data:
        try:
            # Create user account
            user, created = CustomerUser.objects.get_or_create(
                username=worker_data["username"],
                defaults={
                    "email": worker_data["email"],
                    "role": "worker",
                    "is_active": True
                }
            )
            
            if created:
                user.set_password("password123")  # Default password
                user.save()
                print(f"Created worker user: {user.username}")
            else:
                print(f"Worker user already exists: {user.username}")
            
            # Create or update user profile
            user_profile, created = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    "phone": worker_data["phone"],
                    "address": worker_data["address"]
                }
            )
            if not created:
                user_profile.phone = worker_data["phone"]
                user_profile.address = worker_data["address"]
                user_profile.save()
            
            # Create or update worker profile
            profession = professions.get(worker_data["profession"])
            if not profession:
                print(f"Warning: Profession '{worker_data['profession']}' not found")
                continue
                
            worker_profile, created = Worker.objects.get_or_create(
                user=user,
                defaults={
                    "name": worker_data["username"].replace("_", " ").title(),
                    "profession": profession,
                    "experience": worker_data["experience"],
                    "bio": worker_data["bio"],
                    "email": worker_data["email"],
                    "phone": worker_data["phone"],
                    "location": worker_data["address"],
                    "is_active": True
                }
            )
            
            if not created:
                worker_profile.name = worker_data["username"].replace("_", " ").title()
                worker_profile.profession = profession
                worker_profile.experience = worker_data["experience"]
                worker_profile.bio = worker_data["bio"]
                worker_profile.email = worker_data["email"]
                worker_profile.phone = worker_data["phone"]
                worker_profile.location = worker_data["address"]
                worker_profile.is_active = True
                worker_profile.save()
            
            # Create services
            for service_name in worker_data["services"]:
                WorkerService.objects.get_or_create(
                    worker=worker_profile,
                    services=service_name,
                    defaults={"price": worker_data["hourly_rate"]}
                )
            
            print(f"Setup worker profile for: {worker_data['username']}")
            
        except Exception as e:
            print(f"Error creating worker {worker_data['username']}: {e}")

def main():
    """Main function to seed all data"""
    print("Starting data seeding...")
    
    # Create professions
    print("\n=== Creating Professions ===")
    professions = create_professions()
    
    # Create workers
    print("\n=== Creating Workers ===")
    create_workers()
    
    print("\n=== Data Seeding Complete ===")
    print(f"Created {Profession.objects.count()} professions")
    print(f"Created {CustomerUser.objects.filter(role='worker').count()} workers")
    print(f"Created {Worker.objects.count()} worker profiles")
    
    # Test data
    print("\n=== Test Data ===")
    for profession in Profession.objects.all():
        worker_count = Worker.objects.filter(profession=profession).count()
        print(f"{profession.name}: {worker_count} workers")

if __name__ == "__main__":
    main()
