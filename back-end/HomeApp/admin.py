from django.contrib import admin
from .models import UserProfile,WorkerService,Worker,CustomerUser,WorkerRating,Profession
# Register your models here.
admin.site.register(UserProfile)
admin.site.register(WorkerService)
admin.site.register(Worker)
admin.site.register(CustomerUser)
admin.site.register(WorkerRating)

@admin.register(Profession)
class ProfessionAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}


# admin.site.register(Booking)