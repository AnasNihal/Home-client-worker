from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator

class ServiceCategory(models.Model):
    service = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=100.00)

    def __str__(self):
        return self.service


class Worker(models.Model):
    services = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name="workers", null=True, blank=True)
    image = models.ImageField(upload_to='worker_image/', blank=True, null=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?\d{7,15}$',
                message="Enter a valid phone number."
            )
        ]
    )
    profession = models.CharField(max_length=50 ,null=True, blank=True)
    experience = models.CharField(max_length=50, null=True, blank=True)
    available = models.BooleanField(default=True, db_index=True)
    location = models.CharField(max_length=50, null=True)
    bio = models.TextField(blank=True, null=True)
    email = models.EmailField(max_length=255, unique=True, blank=True, null=True)

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="profiles")
    image = models.ImageField(upload_to='user_image/', blank=True, null=True)
    phone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?\d{7,15}$',
                message="Enter a valid phone number."
            )
        ],
        blank=True,
        null=True
    )
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    postal_code = models.CharField(max_length=10, blank=True, null=True)
    country = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.user.username


class Booking(models.Model):
    STATUS_CHOICE = (
        ('Pending', 'Pending'),
        ('Assigned', 'Assigned'),
        ('Completed', 'Completed'),
        ('Canceled', 'Canceled'),
    )

    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings", null=True, blank=True)
    service = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True)
    worker = models.ForeignKey(Worker, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICE, default='Pending')
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.customer.username} - {self.service.service if self.service else 'No Service'}"
