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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_booking(request, worker_id):
    """
    User creates a booking for a specific worker & one service
    Only one booking per worker per day is allowed.
    """
    if request.user.role.lower() != "user":
        return Response({"detail": "Only users can book services"}, status=403)

    worker = get_object_or_404(Worker, pk=worker_id)
    service_id = request.data.get("service_id")
    date_str = request.data.get("date")
    time = request.data.get("time")
    payment_mode = (request.data.get("payment_mode") or "later").lower()

    if not service_id or not date_str:
        return Response({"detail": "Service and date must be provided"}, status=400)

    if payment_mode not in ["later", "now"]:
        return Response({"detail": "Invalid payment_mode. Use 'later' or 'now'."}, status=400)

    # Convert date string to Python date object
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=400)

    # Validate booking date is not in the past
    from datetime import date as date_type
    if date_obj < date_type.today():
        return Response({"detail": "Cannot book for past dates. Please select an upcoming date."}, status=400)

    # Validate time is within working hours (9 AM to 6 PM)
    if time:
        try:
            time_obj = datetime.strptime(time, "%H:%M").time()
            from datetime import time as time_type
            morning_start = time_type(9, 0)  # 9 AM
            evening_end = time_type(18, 0)   # 6 PM
            
            if time_obj < morning_start or time_obj >= evening_end:
                return Response({
                    "detail": "Workers are only available from 9 AM to 6 PM. Please select a time within working hours."
                }, status=400)
        except ValueError:
            return Response({"detail": "Invalid time format. Use HH:MM."}, status=400)

    # Check for existing booking for this user/worker on the same date/time
    existing_booking = Booking.objects.filter(
        user=request.user,
        worker=worker,
        date=date_obj,
        time=time,
        status__in=["pending", "accepted", "confirmed"]
    ).first()

    if existing_booking:
        return Response(BookingSerializer(existing_booking, context={"request": request}).data, status=200)

    # Check for worker availability on the same date
    conflict = Booking.objects.filter(
        worker=worker,
        date=date_obj,
        status__in=["pending", "accepted", "confirmed"]
    ).exists()

    if conflict:
        return Response(
            {"detail": f"{worker.name} is already booked on {date_obj}. Please choose another day."},
            status=400
        )

    # Prepare serializer data
    data = {
        "service_id": service_id,
        "date": date_obj,
        "time": time,
    }

    serializer = BookingSerializer(data={**data, "payment_mode": payment_mode})
    if serializer.is_valid():
        service = get_object_or_404(WorkerService, pk=service_id, worker=worker)

        base_amount = Decimal(service.price or 0)
        
        MINIMUM_AMOUNT_INR = Decimal("100.00")
        if base_amount < MINIMUM_AMOUNT_INR:
            return Response({
                "detail": f"Minimum booking amount is ₹{MINIMUM_AMOUNT_INR}. Current amount is ₹{base_amount}."
            }, status=400)
        
        pay_later_fee = Decimal("20.00")

        with transaction.atomic():
            booking = serializer.save(
                user=request.user,
                worker=worker,
                status="pending",
                amount=base_amount,
                pay_later_fee=pay_later_fee,
                payment_status="due",
            )

        response_payload = BookingSerializer(booking, context={"request": request}).data

        return Response(response_payload, status=201)
    else:
        return Response(serializer.errors, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_bookings(request):
    """
    List bookings for the logged-in user
    """
    if request.user.role.lower() != "user":
        return Response({"detail": "Only users can view their bookings"}, status=403)

    bookings = Booking.objects.filter(user=request.user).order_by("-created_at")
    serializer = BookingSerializer(bookings, many=True, context={"request": request})  # <-- pass context
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def worker_bookings(request):
    """
    List bookings assigned to the logged-in worker
    """
    if request.user.role.lower() != "worker":
        return Response({"detail": "Only workers can view bookings"}, status=403)

    worker = get_object_or_404(Worker, user=request.user)
    bookings = Booking.objects.filter(worker=worker).order_by("-created_at")
    return Response(BookingSerializer(bookings, many=True).data)


@api_view(["PATCH"])  # <- Accept PATCH requests
@permission_classes([IsAuthenticated])
def update_booking_status(request, booking_id):
    """
    Worker accepts/declines a booking
    """
    if request.user.role.lower() != "worker":
        return Response({"detail": "Only workers can update booking status"}, status=403)

    booking = get_object_or_404(Booking, pk=booking_id, worker__user=request.user)
    new_status = request.data.get("status")

    if new_status not in ["accepted", "declined", "completed", "canceled"]:
        return Response({"detail": "Invalid status"}, status=400)

    booking.status = new_status
    booking.save()

    # Send email to user about booking update
    send_mail(
        "Booking Update",
        f"Your booking for {booking.service} with {booking.worker.name} is now {booking.status}.",
        "noreply@homeservice.com",
        [booking.user.email],
        fail_silently=True,
    )

    return Response(BookingSerializer(booking).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    """
    User cancels their own booking
    """
    if request.user.role.lower() != "user":
        return Response({"detail": "Only users can cancel bookings"}, status=403)

    booking = get_object_or_404(Booking, pk=booking_id, user=request.user)

    if booking.status in ["canceled", "completed", "declined"]:
        return Response({"detail": "Cannot cancel this booking"}, status=400)

    booking.status = "canceled"
    booking.save()

    # Optionally, notify worker via email
    send_mail(
        "Booking Canceled",
        f"The booking for {booking.service} by {booking.user.username} has been canceled.",
        "noreply@homeservice.com",
        [booking.worker.user.email],  # pyright: ignore
        fail_silently=True,
    )

    return Response(BookingSerializer(booking).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def user_complete_booking(request, booking_id):
    """
    User marks their booking as completed
    """
    if request.user.role.lower() != "user":
        return Response({"detail": "Only users can complete bookings"}, status=403)

    booking = get_object_or_404(Booking, pk=booking_id, user=request.user)

    if booking.status != "accepted":
        return Response({"detail": "Booking must be accepted first"}, status=400)

    booking.status = "completed"
    booking.save()

    return Response(BookingSerializer(booking, context={"request": request}).data, status=200)
