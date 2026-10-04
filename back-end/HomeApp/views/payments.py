from datetime import datetime
from decimal import Decimal
import logging

import stripe
from django.conf import settings
from django.core.mail import send_mail
from django.db import IntegrityError, transaction
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
    if booking.status in {"canceled", "completed", "declined"}:
        return Response({"detail": "This booking is not payable."}, status=400)

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

    worker = get_object_or_404(
        Worker,
        pk=worker_id,
        is_active=True,
        verification_status="approved",
    )
    service_id = request.data.get("service_id")
    date_str = request.data.get("date")
    time = request.data.get("time")

    if not service_id or not date_str or not time:
        return Response({"detail": "Service, date, and time must be provided"}, status=400)

    if not settings.STRIPE_SECRET_KEY:
        return Response({"detail": "Stripe is not configured. Add STRIPE_SECRET_KEY."}, status=500)

    # Get service and calculate amount
    service = get_object_or_404(
        WorkerService,
        pk=service_id,
        worker=worker,
        is_active=True,
    )
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
            time_slot=time_obj,
            status__in=["pending", "accepted", "confirmed", "in_progress"]
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
        logging.getLogger(__name__).exception("Stripe checkout session creation failed")
        return Response({"detail": "Unable to create the payment session right now."}, status=502)


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
        if str(metadata.get("user_id")) != str(request.user.id):
            return Response({"detail": "This payment session does not belong to you."}, status=403)
        if getattr(session, "payment_status", None) != "paid":
            return Response({"detail": "Payment has not been completed."}, status=402)
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

        if getattr(session, "payment_status", None) != "paid":
            return Response({"detail": "Payment has not been completed."}, status=402)
        if str(metadata.get("user_id")) != str(request.user.id):
            return Response({"detail": "This payment session does not belong to you."}, status=403)
        
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
        worker = get_object_or_404(
            Worker,
            pk=worker_id,
            is_active=True,
            verification_status="approved",
        )
        service = get_object_or_404(
            WorkerService,
            pk=service_id,
            worker=worker,
            is_active=True,
        )
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        time_obj = datetime.strptime(time, "%H:%M").time()
        base_amount = Decimal(amount_str)

        if base_amount != service.price or base_amount < Decimal("100.00"):
            return Response({"detail": "The payment amount no longer matches the selected service."}, status=400)
        session_amount = getattr(session, "amount_total", None)
        if session_amount is not None and int(base_amount * 100) != int(session_amount):
            return Response({"detail": "The payment amount could not be verified."}, status=400)

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
            time_slot=time_obj,
            status__in=["pending", "accepted", "confirmed", "in_progress"]
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
            time_slot=time_obj,
            status__in=["pending", "accepted", "confirmed", "in_progress"]
        ).exists()

        if conflict:
            return Response(
                {"error": "This slot is already booked."},
                status=status.HTTP_409_CONFLICT
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
            try:
                with transaction.atomic():
                    booking = serializer.save(
                        user=request.user,
                        worker=worker,
                        status="accepted",  # Auto-accept since payment is completed
                        amount=base_amount,
                        pay_later_fee=Decimal("0.00"),  # No fee for pay now
                        payment_status="paid",
                        stripe_checkout_session_id=session.id,
                    )

                    # Create payment record only if the booking insert succeeds.
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
            except IntegrityError:
                return Response(
                    {"error": "This slot is already booked."},
                    status=status.HTTP_409_CONFLICT,
                )

            return Response(
                BookingSerializer(booking, context={"request": request}).data, 
                status=201
            )
        else:
            return Response(serializer.errors, status=400)

    except IntegrityError:
        return Response(
            {"error": "This slot is already booked."},
            status=status.HTTP_409_CONFLICT,
        )
    except Exception:
        logging.getLogger(__name__).exception("Booking creation from Stripe session failed")
        return Response({"detail": "Unable to confirm this payment right now."}, status=502)

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

        # A signed webhook is authentic, but only a paid Checkout Session may
        # mark a booking as paid. This prevents an unpaid session event from
        # changing booking/payment state.
        if session.get("payment_status") != "paid":
            return HttpResponse(status=200)
        
        booking_id = session.get("metadata", {}).get("booking_id")
        if booking_id:
            try:
                with transaction.atomic():
                    booking = Booking.objects.get(id=booking_id)
                    metadata_user_id = session.get("metadata", {}).get("user_id")
                    if metadata_user_id and str(metadata_user_id) != str(booking.user_id):
                        return HttpResponse(status=200)
                    if session.get("amount_total") is not None and int(session["amount_total"]) != int(booking.amount * 100):
                        return HttpResponse(status=200)
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
