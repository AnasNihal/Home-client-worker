from django.shortcuts import render
from .models import ServiceCategory,Booking,Worker
from .serializers import ServiceCategorySerializer,WorkerSerializer,BookingSerializer
from rest_framework import viewsets


class ServiceCategoryViewset(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer

class WorkerViewset(viewsets.ModelViewSet):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer

class BookingViewset(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
