from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from django.conf import settings
from django.utils.text import slugify



class CustomerUser(AbstractUser):
    ROLE_CHOICES = (
        ('user','User'),
        ('worker','Worker')
    )
    role = models.CharField(max_length=10,choices=ROLE_CHOICES,default='user')


class UserProfile(models.Model):
    user = models.OneToOneField(CustomerUser, on_delete=models.CASCADE, related_name="profiles")
    profileimage = models.ImageField(upload_to='user_image/', blank=True, null=True)
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
    bio = models.TextField(blank=True, null=True)  
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    postal_code = models.CharField(max_length=10, blank=True, null=True)
    country = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.user.username
    
class Profession(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    

    def save(self, *args, **kwargs):
        if not self.slug:  # only set slug if empty
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Worker(models.Model):
    user = models.OneToOneField(CustomerUser,on_delete=models.CASCADE ,related_name='worker_profile', null=True, blank=True)
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
    profession = models.ForeignKey(Profession,on_delete=models.CASCADE)
    experience = models.CharField(max_length=50, null=True, blank=True)
    location = models.CharField(max_length=50, null=True)
    bio = models.TextField(blank=True, null=True)
    email = models.EmailField(max_length=255, unique=True, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)  # example: 4.50
    review = models.TextField(blank=True, null=True)  # user reviews / feedback
    location = models.CharField(max_length=255, blank=True, null=True)  # e.g. "Bangalore"
    is_active = models.BooleanField(default=True)
    availability_dates = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.name

class WorkerService(models.Model):
    worker = models.ForeignKey(Worker,on_delete=models.CASCADE, related_name='services')
    services = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=100.00)

    def __str__(self):
        return self.services
    
class WorkerRating(models.Model):
    worker = models.ForeignKey(Worker, related_name="ratings", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(default=1)  # 1–5 stars
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("worker", "user") 

# models.py
class Booking(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
        ("completed", "Completed"),
        ("canceled", "Canceled"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings"
    )
    worker = models.ForeignKey(
        Worker,
        on_delete=models.CASCADE,
        related_name="bookings"
    )
    service = models.ForeignKey(
        WorkerService,
        on_delete=models.CASCADE,
        related_name="bookings"
    )
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking {self.id} - {self.user.username} → {self.worker.name}"




