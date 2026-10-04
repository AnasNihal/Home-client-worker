from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("HomeApp", "0012_booking_time_slot_and_unique_active_worker_booking_time_slot"),
    ]

    operations = [
        migrations.AddField(
            model_name="worker",
            name="verification_status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("approved", "Approved"),
                    ("rejected", "Rejected"),
                ],
                default="approved",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="workerservice",
            name="is_active",
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name="booking",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("confirmed", "Confirmed"),
                    ("accepted", "Accepted"),
                    ("in_progress", "In Progress"),
                    ("declined", "Declined"),
                    ("completed", "Completed"),
                    ("canceled", "Canceled"),
                ],
                default="pending",
                max_length=20,
            ),
        ),
        migrations.RemoveConstraint(
            model_name="booking",
            name="unique_active_worker_booking_time_slot",
        ),
        migrations.AddConstraint(
            model_name="booking",
            constraint=models.UniqueConstraint(
                condition=models.Q(status__in=["pending", "confirmed", "accepted", "in_progress"]),
                fields=("worker", "date", "time_slot"),
                name="unique_active_worker_booking_time_slot",
            ),
        ),
    ]
