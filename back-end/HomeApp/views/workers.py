from datetime import datetime
from decimal import Decimal
import logging

import stripe
from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Avg
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import Booking, Payment, Profession, UserProfile, Worker, WorkerRating, WorkerService
from ..serializers import (
    BookingSerializer,
    ProfessionSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
    WorkerRegistrationSerializer,
    WorkerSerializer,
    WorkerServiceSerializer,
)


@api_view(['GET', 'PUT'])  # pyright: ignore
@permission_classes([IsAuthenticated])  # pyright: ignore
def worker_dashboard(request):
    if request.user.role.lower() != "worker":
        return Response({"detail": "Only workers can access this page"}, status=403)

    worker = get_object_or_404(Worker, user=request.user)

    if request.method == 'GET':
        # Serialize worker basic info
        worker_data = WorkerSerializer(worker).data  

        # Get all bookings for this worker
        completed_jobs = Booking.objects.filter(worker=worker, status="completed").count()

        ratings_qs = WorkerRating.objects.filter(worker=worker)
        avg_rating = ratings_qs.aggregate(Avg('rating'))['rating__avg']
        total_ratings = ratings_qs.count()

        bookings = Booking.objects.filter(worker=worker).select_related("user", "service")
        bookings_data = [
            {
                "id": b.id,  # pyright: ignore
                "user_name": b.user.username,
                "services": [b.service.services],  # corrected field name
                "date": b.date,
                "time": b.time,
                "status": b.status,
            }
            for b in bookings
        ]

        reviews = WorkerRating.objects.filter(worker=worker).select_related("user").order_by("-created_at")
        reviews_list = [
            {
                "id": r.id,  # pyright: ignore
                "user__username": r.user.username,
                "rating": r.rating,
                "review": r.review,
                "created_at": r.created_at.strftime("%Y-%m-%d %H:%M"),
            }
            for r in reviews
        ]

        return Response({
            **worker_data,
            "bookings_count": bookings.count(),
            "completed_jobs": completed_jobs,
            "bookings": bookings_data,
            "ratings": {
                "average_rating": round(avg_rating, 1) if avg_rating else 0,
                "total_ratings": total_ratings,
            },
            "reviews": reviews_list,
        })

    elif request.method == "PUT":
        # If an image is uploaded
        if "image" in request.FILES:
            worker.image = request.FILES["image"]
            worker.save()
            serializer = WorkerSerializer(worker)
            return Response(serializer.data)

        # Otherwise, handle JSON/profile updates
        serializer = WorkerSerializer(worker, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_service(request):
    if request.user.role.lower() != "worker":
        return Response({"detail": "Only workers can add services"}, status=403)

    worker = get_object_or_404(Worker, user=request.user)
    serializer = WorkerServiceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(worker=worker)  # 👈 tie service to logged-in worker
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PUT', 'PATCH', 'DELETE'])  # pyright: ignore
@permission_classes([IsAuthenticated])  # pyright: ignore
def edit_service(request, service_id):
    if request.user.role.lower() != "worker":
        return Response({'detail': 'Only workers can modify services'}, status=403)

    worker = get_object_or_404(Worker, user=request.user)
    service = get_object_or_404(WorkerService, id=service_id, worker=worker)

    if request.method in ['PUT', 'PATCH']:
        serializer = WorkerServiceSerializer(service, data=request.data, partial=(request.method=='PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        service.delete()
        return Response(status=204)

# ✅ List all workers with ratings included


@api_view(['GET'])
def worker_list(request):
    workers = Worker.objects.select_related('user', 'profession').all()
    serializer = WorkerSerializer(workers, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def worker_details(request, pk):
    worker = get_object_or_404(Worker, pk=pk)
    serializer = WorkerSerializer(worker, context={'request': request})

    # ✅ Completed jobs count
    completed_jobs = Booking.objects.filter(worker=worker, status="completed").count()

    # Fetch reviews directly from WorkerRating
    reviews = WorkerRating.objects.filter(worker=worker).select_related("user").order_by("-created_at")
    reviews_list = [
        {
            "id": r.id,  # pyright: ignore
            "user": r.user.username,
            "rating": r.rating,
            "review": r.review,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M")  # optional
        }
        for r in reviews
    ]

    return Response({
        **serializer.data,
        "completedJobs": completed_jobs,   # 👈 added field
        "ratings_list": reviews_list       # 👈 reviews attached here
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def rate_worker(request, worker_id):
    # ✅ Ensure only "users" can rate
    if request.user.role.lower() != "user":
        return Response({"detail": "Only users can rate workers"}, status=403)

    worker = get_object_or_404(Worker, pk=worker_id)

    # Get rating & review
    rating_value = request.data.get("rating")
    review_text = request.data.get("review", "").strip()

    if not rating_value:
        return Response({"error": "Rating is required"}, status=400)

    try:
        rating_value = int(rating_value)
    except ValueError:
        return Response({"error": "Rating must be a number"}, status=400)

    if rating_value < 1 or rating_value > 5:
        return Response({"error": "Rating must be between 1 and 5"}, status=400)

    # Create or update rating with review
    WorkerRating.objects.update_or_create(
        worker=worker,
        user=request.user,
        defaults={"rating": rating_value, "review": review_text}
    )

    # Calculate updated stats
    avg = WorkerRating.objects.filter(worker=worker).aggregate(Avg('rating'))['rating__avg']
    total = WorkerRating.objects.filter(worker=worker).count()

    # Fetch all reviews
    reviews = WorkerRating.objects.filter(worker=worker).select_related("user").values(
        "id", "rating", "review", "user__username"
    )

    return Response({
        "message": "Rating submitted successfully",
        "average_rating": round(avg, 1) if avg else 0,
        "total_ratings": total,
        "reviews": list(reviews)
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def profession_list(request):
    """
    Return a list of all professions
    """
    professions = Profession.objects.all()
    serializer = ProfessionSerializer(professions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



# Booking section


from datetime import datetime

from django.conf import settings
from django.http import HttpResponse # For webhook
from decimal import Decimal
import stripe
from django.views.decorators.csrf import csrf_exempt
