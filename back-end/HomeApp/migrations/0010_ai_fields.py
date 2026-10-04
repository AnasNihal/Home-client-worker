from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("HomeApp", "0009_enforce_minimum_service_price")]

    operations = [
        migrations.AddField(
            model_name="worker",
            name="latitude",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name="worker",
            name="longitude",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name="worker",
            name="service_radius_km",
            field=models.PositiveIntegerField(default=25),
        ),
        migrations.AddField(
            model_name="worker",
            name="working_hours",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="workerrating",
            name="moderation_reason",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="workerrating",
            name="moderation_status",
            field=models.CharField(default="approved", max_length=20),
        ),
        migrations.CreateModel(
            name="ServiceRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("original_text", models.TextField()),
                ("normalized_service", models.CharField(blank=True, max_length=255)),
                ("location", models.CharField(blank=True, max_length=255)),
                ("preferred_date", models.DateField(blank=True, null=True)),
                ("preferred_time", models.TimeField(blank=True, null=True)),
                ("budget", models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ("ai_confidence", models.DecimalField(decimal_places=3, default=0, max_digits=4)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("profession", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="HomeApp.profession")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="service_requests", to="HomeApp.customeruser")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
