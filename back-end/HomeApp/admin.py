from django.contrib import admin
from .models import UserProfile,WorkerService
# Register your models here.
admin.site.register(UserProfile)
admin.site.register(WorkerService)
# admin.site.register(Booking)