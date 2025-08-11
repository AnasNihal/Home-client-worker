from django.db import models
from django.contrib.auth.models import User 

class ServiceCategory(models.Model):
    name =models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Worker(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=12)
    category = models.ForeignKey(ServiceCategory,on_delete=models.SET_NULL,null=True)
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Booking(models.Model):
    STATUS_CHOICE = (
        ('Pending','Pending'),
        ('Assigned','Assigned'),
        ('Completed','Completed'),
        ('Canceled','Canceled'),
    )

    constomer = models.ForeignKey(User,on_delete=models.CASCADE)
    service = models.ForeignKey(ServiceCategory,on_delete=models.SET_NULL,null=True)
    worker = models.ForeignKey(Worker,on_delete=models.SET_NULL,null=True,blank=True)
    date = models.DateField()
    status = models.CharField(max_length=10,choices=STATUS_CHOICE,default='Pending')
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.constomer.username} - {self.service.name}"