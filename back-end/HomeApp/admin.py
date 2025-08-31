from django.contrib import admin
from .models import UserProfile,WorkerService,Worker,CustomerUser,WorkerRating
# Register your models here.
admin.site.register(UserProfile)
admin.site.register(WorkerService)
admin.site.register(Worker)
admin.site.register(CustomerUser)
admin.site.register(WorkerRating)

# admin.site.register(Booking)