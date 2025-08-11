from rest_framework import serializers
from .models import ServiceCategory,Worker,Booking

class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        filed = "__all__"

class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        filed = "__all__"
    
class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        field = "__all__"

 