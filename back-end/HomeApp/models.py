from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from django.conf import settings


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
    profession = models.CharField(max_length=50 ,null=True, blank=True)
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




# class Booking(models.Model):
#     STATUS_CHOICE = (
#         ('Pending', 'Pending'),
#         ('Assigned', 'Assigned'),
#         ('Completed', 'Completed'),
#         ('Canceled', 'Canceled'),
#     )

#     customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings", null=True, blank=True)
#     service = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True)
#     worker = models.ForeignKey(Worker, on_delete=models.SET_NULL, null=True, blank=True)
#     date = models.DateField()
#     status = models.CharField(max_length=10, choices=STATUS_CHOICE, default='Pending')
#     notes = models.TextField(blank=True)

#     def __str__(self):
#         return f"{self.customer.username} - {self.service.service if self.service else 'No Service'}"
