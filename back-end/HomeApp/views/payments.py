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
def create_stripe_checkout_session(request, booking_id):
    """Create a Stripe Checkout Session for an existing Pending Booking"""
    if request.user.role.lower() != "user":
        return Response({"detail": "Only users can pay for bookings"}, status=403)

    booking = get_object_or_404(Booking, pk=booking_id, user=request.user)
    
    if booking.payment_status == "paid":
        return Response({"detail": "Booking is already paid"}, status=400)

    if not settings.STRIPE_SECRET_KEY:
        return Response({"detail": "Stripe is not configured. Add STRIPE_SECRET_KEY."}, status=500)

    stripe.api_key = settings.STRIPE_SECRET_KEY
    amount_paise = int(booking.amount * 100)

    # Note: We don't create Payment record yet, we'll do that in the webhook
    # or upon confirmation.
    
    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=[
            {
                "price_data": {
                    "currency": "inr",
                    "product_data": {
                        "name": f"Booking - {booking.service.services}",
                    },
                    "unit_amount": amount_paise,
                },
                "quantity": 1,
            }
        ],
        success_url=f"{settings.FRONTEND_BASE_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.FRONTEND_BASE_URL}/payment/cancel",
        metadata={
            "booking_id": str(booking.id),
            "user_id": str(request.user.id),
        },
    )

    booking.stripe_checkout_session_id = session.id
    booking.save(update_fields=["stripe_checkout_session_id"])

    return Response({"checkout_url": session.url, "session_id": session.id}, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_stripe_checkout_session_new(request, worker_id):
    """Create a Stripe Checkout Session without creating booking first"""
    if request.user.role.lower() != "user":
        return Response({"detail": "Only users can book services"}, status=403)

    worker = get_object_or_404(Worker, pk=worker_id)
    service_id = request.data.get("service_id")
    date_str = request.data.get("date")
    time = request.data.get("time")

    if not service_id or not date_str or not time:
        return Response({"detail": "Service, date, and time must be provided"}, status=400)

    if not settings.STRIPE_SECRET_KEY:
        return Response({"detail": "Stripe is not configured. Add STRIPE_SECRET_KEY."}, status=500)

    # Get service and calculate amount
    service = get_object_or_404(WorkerService, pk=service_id, worker=worker)
    base_amount = Decimal(service.price or 0)
    
    MINIMUM_AMOUNT_INR = Decimal("100.00")
    if base_amount < MINIMUM_AMOUNT_INR:
        return Response({
            "detail": f"Minimum booking amount is ₹{MINIMUM_AMOUNT_INR}. Current amount is ₹{base_amount}."
        }, status=400)

    amount_paise = int(base_amount * 100)

    stripe.api_key = settings.STRIPE_SECRET_KEY

    try:
        # Convert date string to Python date object for validation
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        
        # Validate booking date is not in the past
        from datetime import date as date_type
        if date_obj < date_type.today():
            return Response({"detail": "Cannot book for past dates. Please select an upcoming date."}, status=400)

        # Validate time is within working hours (9 AM to 6 PM)
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
        
        # Check for existing booking conflict
        conflict = Booking.objects.filter(
            worker=worker,
            date=date_obj,
            status__in=["pending", "accepted"]
        ).exists()

        if conflict:
            return Response(
                {"detail": f"{worker.name} is already booked on {date_obj}. Please choose another day."},
                status=400
            )

        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": "inr",
                        "product_data": {
                            "name": f"Booking - {service.services}",
                        },
                        "unit_amount": amount_paise,
                    },
                    "quantity": 1,
                }
            ],
            success_url=f"{settings.FRONTEND_BASE_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_BASE_URL}/payment/cancel",
            metadata={
                "worker_id": str(worker.id),
                "service_id": str(service.id),
                "user_id": str(request.user.id),
                "date": date_str,
                "time": time,
                "payment_mode": "now",
                "amount": str(base_amount),
            },
        )

        return Response({
            "checkout_url": session.url, 
            "session_id": session.id
        }, status=200)

    except ValueError:
        return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=400)
    except Exception as e:
        return Response({"detail": f"Failed to create Stripe session: {str(e)}"}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def confirm_stripe_payment(request):
    """Called by frontend on success_url to create booking and confirm payment"""
    session_id = request.query_params.get("session_id")
    if not session_id:
        return Response({"detail": "session_id is required"}, status=400)

    if not settings.STRIPE_SECRET_KEY:
        return Response({"detail": "Stripe is not configured. Add STRIPE_SECRET_KEY."}, status=500)

    stripe.api_key = settings.STRIPE_SECRET_KEY

    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Stripe session retrieve failed: {str(e)}")
        return Response({"detail": "Failed to retrieve Stripe session"}, status=400)

    metadata = session.metadata if getattr(session, "metadata", None) else {}
    
    # Check if this is a new booking flow (no booking_id in metadata)
    if not metadata.get("booking_id") and metadata.get("worker_id"):
        return create_booking_from_payment_session(request, session, metadata)
    
    # Existing booking flow
    booking_id = metadata.get("booking_id")
    if not booking_id:
        return Response({"detail": "Invalid session configuration"}, status=400)

    booking = get_object_or_404(Booking, id=booking_id, user=request.user)

    if session.payment_status == "paid":
        # The webhook might have beaten us to this, but we'll check and update just in case.
        if booking.payment_status != "paid":
            booking.payment_status = "paid"
            booking.save(update_fields=["payment_status"])
            
            # Create payment record as a fallback if webhook is slow
            from django.utils import timezone
            from ..models import Payment
            Payment.objects.get_or_create(
                booking=booking,
                stripe_session_id=session.id,
                defaults={
                    "user": booking.user,
                    "worker": booking.worker,
                    "amount": booking.amount,
                    "currency": session.currency or "inr",
                    "payment_status": "paid",
                    "stripe_payment_intent_id": session.payment_intent,
                    "paid_at": timezone.now()
                }
            )

    return Response(BookingSerializer(booking, context={"request": request}).data, status=200)


def create_booking_from_payment_session(request, session, metadata):
    """Create booking after successful payment from Stripe session metadata"""
    try:
        from django.utils import timezone
        from ..models import Payment
        
        # Extract metadata
        worker_id = metadata.get("worker_id")
        service_id = metadata.get("service_id")
        date_str = metadata.get("date")
        time = metadata.get("time")
        payment_mode = metadata.get("payment_mode", "now")
        amount_str = metadata.get("amount")

        if not all([worker_id, service_id, date_str, time, amount_str]):
            return Response({"detail": "Invalid session metadata"}, status=400)

        # Get objects
        worker = get_object_or_404(Worker, pk=worker_id)
        service = get_object_or_404(WorkerService, pk=service_id, worker=worker)
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        base_amount = Decimal(amount_str)

        existing_by_session = Booking.objects.filter(
            stripe_checkout_session_id=session.id,
            user=request.user,
        ).first()

        if existing_by_session:
            return Response(
                BookingSerializer(existing_by_session, context={"request": request}).data,
                status=200
            )

        existing_same_slot = Booking.objects.filter(
            user=request.user,
            worker=worker,
            date=date_obj,
            time=time,
            status__in=["pending", "accepted", "confirmed", "completed"]
        ).first()

        if existing_same_slot:
            return Response(
                BookingSerializer(existing_same_slot, context={"request": request}).data,
                status=200
            )

        # Double-check no conflict exists
        conflict = Booking.objects.filter(
            worker=worker,
            date=date_obj,
            status__in=["pending", "accepted", "confirmed"]
        ).exists()

        if conflict:
            return Response(
                {"detail": f"{worker.name} is already booked on {date_obj}. Please contact support."},
                status=400
            )

        # Create booking
        booking_data = {
            "service_id": service_id,
            "date": date_obj,
            "time": time,
            "payment_mode": payment_mode,
        }

        serializer = BookingSerializer(data=booking_data)
        if serializer.is_valid():
            booking = serializer.save(
                user=request.user,
                worker=worker,
                status="accepted",  # Auto-accept since payment is completed
                amount=base_amount,
                pay_later_fee=Decimal("0.00"),  # No fee for pay now
                payment_status="paid",
                stripe_checkout_session_id=session.id,
            )

            # Create payment record
            Payment.objects.create(
                booking=booking,
                user=request.user,
                worker=worker,
                amount=base_amount,
                currency=session.currency or "inr",
                payment_status="paid",
                stripe_session_id=session.id,
                stripe_payment_intent_id=session.payment_intent,
                paid_at=timezone.now()
            )

            return Response(
                BookingSerializer(booking, context={"request": request}).data, 
                status=201
            )
        else:
            return Response(serializer.errors, status=400)

    except Exception as e:
        return Response({"detail": f"Failed to create booking: {str(e)}"}, status=500)

@csrf_exempt


@api_view(["POST"])
@permission_classes([AllowAny])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.headers.get("Stripe-Signature", "")
    webhook_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", None)

    if not webhook_secret:
        return HttpResponse(status=400)

    stripe.api_key = settings.STRIPE_SECRET_KEY

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:  # pyright: ignore
        return HttpResponse(status=400)

    from django.utils import timezone
    from ..models import Payment

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        
        booking_id = session.get("metadata", {}).get("booking_id")
        if booking_id:
            try:
                booking = Booking.objects.get(id=booking_id)
                booking.payment_status = "paid"
                # If pay later was selected but then paid, update payment mode to now
                booking.payment_mode = "now" 
                booking.save(update_fields=["payment_status", "payment_mode"])
                
                Payment.objects.update_or_create(
                    booking=booking,
                    stripe_session_id=session.get("id"),
                    defaults={
                        "user": booking.user,
                        "worker": booking.worker,
                        "amount": booking.amount,
                        "currency": session.get("currency", "inr"),
                        "payment_status": "paid",
                        "stripe_payment_intent_id": session.get("payment_intent"),
                        "paid_at": timezone.now()
                    }
                )
            except Booking.DoesNotExist:
                pass
                
    elif event["type"] == "payment_intent.payment_failed":
        intent = event["data"]["object"]
        # Find session associated with this intent to get metadata
        try:
            sessions = stripe.checkout.Session.list(payment_intent=intent.get("id"), limit=1)
            if sessions.data:
                session = sessions.data[0]
                booking_id = session.get("metadata", {}).get("booking_id")
                if booking_id:
                    booking = Booking.objects.get(id=booking_id)
                    booking.payment_status = "failed"
                    booking.save(update_fields=["payment_status"])
                    
                    Payment.objects.update_or_create(
                        booking=booking,
                        stripe_session_id=session.get("id"),
                        defaults={
                            "user": booking.user,
                            "worker": booking.worker,
                            "amount": booking.amount,
                            "payment_status": "failed",
                            "stripe_payment_intent_id": intent.get("id"),
                        }
                    )
        except Exception:
            pass

    return HttpResponse(status=200)
