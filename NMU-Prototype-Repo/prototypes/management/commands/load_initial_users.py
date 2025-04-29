# management/commands/load_initial_users.py
import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from your_app.models import Department

class Command(BaseCommand):
    help = 'Load initial admin, staff, and student users'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Create admin user if not exists
        admin, created = User.objects.get_or_create(
            email='admin@university.edu',
            defaults={
                'username': 'admin',
                'role': 'admin',
                'full_name': 'System Administrator',
                'is_approved': True
            }
        )
        if created:
            admin.set_password('admin@123')  # Change this in production!
            admin.save()
            self.stdout.write(self.style.SUCCESS('Created admin user'))
        
        # Create sample staff
        staff, created = User.objects.get_or_create(
            email='staff@university.edu',
            defaults={
                'username': 'staff',
                'role': 'staff',
                'full_name': 'Sample Staff',
                'is_approved': True
            }
        )
        if created:
            staff.set_password('staff@123')
            staff.save()
            self.stdout.write(self.style.SUCCESS('Created staff user'))
        
        # Create sample department if needed
        dept, _ = Department.objects.get_or_create(
            code='CS',
            defaults={
                'name': 'Computer Science',
                'description': 'Computer Science Department'
            }
        )
        
        # Create sample student
        student, created = User.objects.get_or_create(
            email='student@university.edu',
            defaults={
                'username': 'student',
                'role': 'student',
                'full_name': 'Sample Student',
                'department': dept,
                'level': 'masters',
                'is_approved': True
            }
        )
        if created:
            student.set_password('student@123')
            student.save()
            self.stdout.write(self.style.SUCCESS('Created student user'))