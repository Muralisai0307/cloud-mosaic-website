import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.services.models import Service
from apps.careers.models import Job, JobApplication
from apps.testimonials.models import Testimonial
from apps.faq.models import FAQItem
from apps.newsletter.models import NewsletterSubscription
from apps.meetings.models import MeetingBooking
from apps.contact.models import ContactMessage

User = get_user_model()


class Command(BaseCommand):
    help = "Idempotently seeds sample data for database initialization."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Initializing seeding process..."))

        # 1. Seed Administrator Superuser
        admin_username = "admin"
        admin_email = "admin@cloudmosaic.com"
        admin_user = User.objects.filter(username=admin_username).first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                username=admin_username,
                email=admin_email,
                password="AdminPassword123",
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"Superuser '{admin_username}' created successfully."
                )
            )
        else:
            self.stdout.write("Superuser 'admin' already exists.")

        # Ensure UserProfile exists for all users
        from apps.accounts.models import UserProfile
        for user in User.objects.all():
            profile, created = UserProfile.objects.get_or_create(user=user)
            if user.username == admin_username and not profile.is_email_verified:
                profile.is_email_verified = True
                profile.save()

        # 1.5 Seed Roles and Permissions
        from apps.accounts.models import Role, UserRole
        from django.contrib.auth.models import Permission

        default_roles = [
            ("Super Admin", "Full system access override."),
            ("Admin", "General administrator with operational control."),
            ("HR Manager", "Manages jobs listings and recruitment processes."),
            ("Recruiter", "Manages and views incoming job applications."),
            ("Sales Manager", "Manages client inquiries and newsletter pipelines."),
            ("Sales Executive", "Views client inquiries and newsletter subscriptions."),
            ("Project Manager", "Reviews scheduled meetings and project scopes."),
            ("Developer", "Internal developer role."),
            ("Client", "External customer role."),
            ("Guest", "Default public role with read-only view access."),
        ]

        role_permissions_matrix = {
            "Super Admin": ["add_user", "change_user", "delete_user", "view_user"],
            "Admin": [
                "view_contactmessage", "delete_contactmessage",
                "view_newslettersubscription", "delete_newslettersubscription",
                "view_meetingbooking", "change_meetingbooking", "delete_meetingbooking",
                "view_testimonial", "change_testimonial", "delete_testimonial",
                "add_service", "change_service", "delete_service", "view_service",
                "add_faqitem", "change_faqitem", "delete_faqitem", "view_faqitem",
            ],
            "HR Manager": [
                "add_job", "change_job", "delete_job", "view_job",
                "view_jobapplication",
            ],
            "Recruiter": [
                "view_job",
                "view_jobapplication", "change_jobapplication",
            ],
            "Sales Manager": [
                "view_contactmessage",
                "view_newslettersubscription",
            ],
            "Sales Executive": [
                "view_contactmessage",
                "view_newslettersubscription",
            ],
            "Project Manager": [
                "view_meetingbooking",
            ],
            "Guest": [
                "view_job", "view_testimonial", "view_service", "view_faqitem"
            ]
        }

        for role_name, desc in default_roles:
            role, created = Role.objects.get_or_create(name=role_name, defaults={"description": desc})
            if created:
                self.stdout.write(self.style.SUCCESS(f"Role '{role_name}' seeded."))

            # Map permissions
            codenames = role_permissions_matrix.get(role_name, [])
            for codename in codenames:
                perm = Permission.objects.filter(codename=codename).first()
                if perm:
                    role.permissions.add(perm)

        # Assign 'Super Admin' role to the seeded admin user
        super_admin_role = Role.objects.filter(name="Super Admin").first()
        if super_admin_role:
            UserRole.objects.get_or_create(user=admin_user, role=super_admin_role)

        # 2. Seed Services
        services_data = [
            {
                "name": "Cloud Architecture Design",
                "slug": "cloud-architecture-design",
                "description": "Enterprise cloud infrastructure design and migration services.",
            },
            {
                "name": "Custom Software Development",
                "slug": "custom-software-development",
                "description": "Full-stack tailored web and mobile applications engineered to scale.",
            },
            {
                "name": "Cybersecurity Consulting",
                "slug": "cybersecurity-consulting",
                "description": "Vulnerability audits, penetration testing, and compliance consulting.",
            },
            {
                "name": "IT Support Services",
                "slug": "it-support-services",
                "description": "24/7 technical helpdesk, monitoring, and remote infrastructure administration.",
            },
            {
                "name": "DevOps Consulting",
                "slug": "devops-consulting",
                "description": "CI/CD pipeline automation, Docker container orchestration, and server maintenance.",
            },
        ]
        for item in services_data:
            obj, created = Service.objects.get_or_create(
                name=item["name"],
                defaults={
                    "slug": item["slug"],
                    "description": item["description"],
                },
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Service '{obj.name}' seeded.")
                )

        # 3. Seed Jobs
        jobs_data = [
            {
                "title": "Senior Cloud Engineer",
                "department": "Engineering",
                "location": "Dallas, TX",
                "description": "Responsible for maintaining multi-tenant AWS and GCP environments.",
                "requirements": "5+ years AWS/GCP experience, Terraform, Kubernetes.",
            },
            {
                "title": "Full Stack Developer",
                "department": "Development",
                "location": "Remote",
                "description": "Develop Django and React based software systems.",
                "requirements": "Python, Django, React, MySQL, REST APIs.",
            },
            {
                "title": "IT Support Specialist",
                "department": "IT Support",
                "location": "Austin, TX",
                "description": "Provide immediate helpdesk assistance to business users.",
                "requirements": "Linux, Active Directory, basic networking.",
            },
        ]
        for item in jobs_data:
            obj, created = Job.objects.get_or_create(
                title=item["title"],
                defaults={
                    "department": item["department"],
                    "location": item["location"],
                    "description": item["description"],
                    "requirements": item["requirements"],
                    "is_active": True,
                },
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Job posting '{obj.title}' seeded.")
                )

        # 4. Seed FAQs
        faq_data = [
            {
                "question": "What services does Cloud Mosaic offer?",
                "answer": "We offer cloud migration, software development, cybersecurity, and IT support services.",
                "category": "Services",
            },
            {
                "question": "Do you support remote work arrangements?",
                "answer": "Yes, many of our development and engineering roles support full-time remote settings.",
                "category": "Careers",
            },
            {
                "question": "How do I schedule a consultation meeting?",
                "answer": "You can use our online Meetings page to pick an open slot that fits your business hours.",
                "category": "Meetings",
            },
            {
                "question": "Are newsletter subscriptions free?",
                "answer": "Yes, you can subscribe to receive system announcements and industry insights at no charge.",
                "category": "General",
            },
        ]
        for item in faq_data:
            obj, created = FAQItem.objects.get_or_create(
                question=item["question"],
                defaults={
                    "answer": item["answer"],
                    "category": item["category"],
                    "is_active": True,
                },
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"FAQ item '{obj.question[:30]}...' seeded.")
                )

        # 5. Seed Testimonials
        testimonials_data = [
            {
                "name": "Sarah Connor",
                "company": "Cyberdyne Systems",
                "service": "Cybersecurity Consulting",
                "rating": 5,
                "review": "Cloud Mosaic secured our infrastructure perfectly. Highly recommended!",
                "status": "approved",
            },
            {
                "name": "Bruce Wayne",
                "company": "Wayne Enterprises",
                "service": "Cloud Architecture Design",
                "rating": 5,
                "review": "The cloud architecture is extremely resilient and operates globally.",
                "status": "approved",
            },
            {
                "name": "Peter Parker",
                "company": "Daily Bugle",
                "service": "IT Support Services",
                "rating": 4,
                "review": "Great customer support. Solved our server storage bottlenecks in no time.",
                "status": "approved",
            },
        ]
        for item in testimonials_data:
            obj, created = Testimonial.objects.get_or_create(
                name=item["name"],
                company=item["company"],
                defaults={
                    "service": item["service"],
                    "rating": item["rating"],
                    "review": item["review"],
                    "status": item["status"],
                },
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Testimonial from '{obj.name}' seeded.")
                )

        # 6. Seed Newsletter Subscriptions
        newsletters_data = [
            {"email": "contact@WayneEnterprises.com"},
            {"email": "support@cyberdyne.org"},
        ]
        for item in newsletters_data:
            obj, created = NewsletterSubscription.objects.get_or_create(
                email=item["email"],
                defaults={"is_active": True},
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Newsletter email '{obj.email}' seeded.")
                )

        # 7. Seed Contact Messages
        contacts_data = [
            {
                "full_name": "Tony Stark",
                "company_name": "Stark Industries",
                "email": "tony@stark.com",
                "phone": "+1234567890",
                "service": "Custom Software Development",
                "subject": "AI Integration project",
                "message": "We need custom React dashboards connected to our core platform databases.",
            }
        ]
        for item in contacts_data:
            obj, created = ContactMessage.objects.get_or_create(
                email=item["email"],
                subject=item["subject"],
                defaults={
                    "full_name": item["full_name"],
                    "company_name": item["company_name"],
                    "phone": item["phone"],
                    "service": item["service"],
                    "message": item["message"],
                },
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Contact inquiry from '{obj.full_name}' seeded.")
                )

        # 8. Seed Meeting Bookings
        meetings_data = [
            {
                "full_name": "Clark Kent",
                "email": "clark@dailyplanet.com",
                "phone": "+1987654321",
                "company": "Daily Planet",
                "service": "IT Support Services",
                "meeting_date": datetime.date.today() + datetime.timedelta(days=5),
                "meeting_time": datetime.time(10, 0),
                "message": "Need troubleshooting for our cloud news publication system.",
                "reference_number": "MEET-CLK-001",
            }
        ]
        for item in meetings_data:
            obj, created = MeetingBooking.objects.get_or_create(
                reference_number=item["reference_number"],
                defaults={
                    "full_name": item["full_name"],
                    "email": item["email"],
                    "phone": item["phone"],
                    "company": item["company"],
                    "service": item["service"],
                    "meeting_date": item["meeting_date"],
                    "meeting_time": item["meeting_time"],
                    "message": item["message"],
                },
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Meeting booked for '{obj.full_name}' seeded.")
                )

        # 9. Seed Projects & Tasks (Employee Portal)
        from apps.employees.models import Project, Task, EmployeeProfile, Notification, EmployeeSettings
        
        # Ensure a developer user exists
        dev_user, created = User.objects.get_or_create(
            username="developer",
            defaults={
                "email": "developer@cloudmosaic.com",
                "first_name": "Dev",
                "last_name": "User",
            }
        )
        if created:
            dev_user.set_password("adminpassword")
            dev_user.save()
            self.stdout.write(self.style.SUCCESS("Developer user created."))

        # Assign Role 'Developer' to developer user
        dev_role = Role.objects.filter(name="Developer").first()
        if dev_role:
            UserRole.objects.get_or_create(user=dev_user, role=dev_role)

        # Ensure profiles exist
        dev_profile, created = EmployeeProfile.objects.get_or_create(
            user=dev_user,
            defaults={
                "employee_id": "EMP-002",
                "department": "Engineering",
                "designation": "Software Developer",
                "joining_date": datetime.date.today(),
                "phone": "+919876543210",
                "skills": ["Django", "Python", "React"],
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("Developer profile seeded."))

        admin_profile, created = EmployeeProfile.objects.get_or_create(
            user=admin_user,
            defaults={
                "employee_id": "EMP-001",
                "department": "Management",
                "designation": "Super Admin",
                "joining_date": datetime.date.today(),
                "phone": "+919876543211",
                "skills": ["Management", "Leadership"],
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("Admin employee profile seeded."))

        # Seed Project
        project, created = Project.objects.get_or_create(
            name="Cloud Mosaic SaaS Portal",
            defaults={
                "client": "Enterprise Client Inc.",
                "description": "Designing and deploying the core tenant architecture.",
                "start_date": datetime.date.today() - datetime.timedelta(days=30),
                "status": "Active",
            }
        )
        if created:
            project.members.add(admin_user)
            project.members.add(dev_user)
            self.stdout.write(self.style.SUCCESS(f"Project '{project.name}' seeded."))

        # Seed Task
        task, created = Task.objects.get_or_create(
            title="Integrate Database Constraints",
            project=project,
            defaults={
                "description": "Configure composite indexes and range checks for testimonials/bookings.",
                "assigned_employee": dev_user,
                "priority": "High",
                "deadline": datetime.date.today() + datetime.timedelta(days=7),
                "status": "In Progress",
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Task '{task.title}' seeded."))

        # Seed Notification
        Notification.objects.get_or_create(
            user=dev_user,
            title="Task Assigned",
            message=f"You have been assigned to task: '{task.title}'",
            defaults={"is_read": False}
        )

        # 10. Seed Client Portal Data
        from apps.clients.models import (
            ClientProfile,
            ClientProject,
            ClientDocument,
            Contract,
            Invoice,
            Payment,
            ClientMeeting,
            SupportTicket,
            ClientSettings,
        )

        client_user, created = User.objects.get_or_create(
            username="clientuser",
            defaults={
                "email": "client@company.com",
                "first_name": "Client",
                "last_name": "Representative",
            }
        )
        if created:
            client_user.set_password("clientpassword")
            client_user.save()
            self.stdout.write(self.style.SUCCESS("Client user created."))

        # Assign Role 'Client' to client user
        client_role = Role.objects.filter(name="Client").first()
        if client_role:
            UserRole.objects.get_or_create(user=client_user, role=client_role)

        # Seed ClientProfile
        client_profile, created = ClientProfile.objects.get_or_create(
            user=client_user,
            defaults={
                "company_name": "Client Corp Inc",
                "company_email": "billing@clientcorp.com",
                "phone": "+15550199",
                "website": "https://clientcorp.com",
                "industry": "Technology",
                "company_size": "Medium",
                "address": "123 Client St",
                "country": "US",
                "state": "NY",
                "city": "New York",
                "postal_code": "10001",
                "contact_person": "Jane Doe",
                "is_active": True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("Client profile seeded."))

        # Seed ClientProject
        client_project, created = ClientProject.objects.get_or_create(
            client=client_profile,
            project_name="Mosaic Portal Integration",
            defaults={
                "description": "Integration of Mosaic portal inside client's intranet.",
                "start_date": datetime.date.today() - datetime.timedelta(days=15),
                "status": "Active",
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Client Project '{client_project.project_name}' seeded."))

        # Seed Contract
        Contract.objects.get_or_create(
            contract_number="CON-001",
            defaults={
                "client": client_profile,
                "project": client_project,
                "title": "Portal Dev Service Agreement",
                "start_date": datetime.date.today() - datetime.timedelta(days=15),
                "end_date": datetime.date.today() + datetime.timedelta(days=180),
                "contract_value": 75000.00,
                "status": "Signed",
            }
        )

        # Seed Invoice
        invoice, created = Invoice.objects.get_or_create(
            invoice_number="INV-2026-001",
            defaults={
                "client": client_profile,
                "project": client_project,
                "amount": 25000.00,
                "due_date": datetime.date.today() + datetime.timedelta(days=15),
                "status": "Sent",
            }
        )

        # Seed Payment
        Payment.objects.get_or_create(
            payment_reference="PAY-REF-001",
            defaults={
                "invoice": invoice,
                "amount": 10000.00,
                "payment_method": "Wire Transfer",
                "status": "Completed",
            }
        )

        # Seed Meeting
        ClientMeeting.objects.get_or_create(
            client=client_profile,
            title="Weekly Alignment Sync",
            meeting_date=datetime.date.today() + datetime.timedelta(days=2),
            defaults={
                "meeting_time": datetime.time(15, 0),
                "meeting_link": "https://meet.google.com/abc-defg-hij",
                "status": "Scheduled",
            }
        )

        # Seed Ticket
        SupportTicket.objects.get_or_create(
            client=client_profile,
            subject="API connection issue",
            defaults={
                "description": "Receiving 403 when posting webhook callbacks.",
                "priority": "High",
                "status": "Open",
            }
        )

        # Seed Settings
        ClientSettings.objects.get_or_create(
            client=client_profile,
            defaults={
                "notification_email": True,
                "notification_sms": True,
                "timezone": "America/New_York",
                "language": "en",
            }
        )

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully."))
