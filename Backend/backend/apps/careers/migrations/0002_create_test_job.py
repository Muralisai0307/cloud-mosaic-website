from django.db import migrations


def create_test_job(apps, schema_editor):
    Job = apps.get_model("careers", "Job")
    Job.objects.get_or_create(
        id=1,
        defaults={
            "title": "Senior Python Backend Developer",
            "department": "Engineering",
            "location": "Remote (India)",
            "description": "We are seeking a senior Django developer to join our consulting team.",
            "requirements": "Strong Python, Django REST Framework, and MySQL experience.",
            "is_active": True,
        },
    )


class Migration(migrations.Migration):
    dependencies = [
        ("careers", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_test_job),
    ]
