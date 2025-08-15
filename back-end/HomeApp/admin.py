from django.contrib import admin
from .models import UserProfile,ServiceCategory,Booking
# Register your models here.
admin.site.register(UserProfile)
admin.site.register(ServiceCategory)
admin.site.register(Booking)