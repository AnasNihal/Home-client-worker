from datetime import datetime
from decimal import Decimal, InvalidOperation
from functools import wraps

from django.contrib.auth import get_user_model
from django.core.paginator import Paginator
from django.db import IntegrityError, transaction
from django.db.models import Avg, Count, Q, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken

from HomeApp.models import Booking, Payment, Profession, UserProfile, Worker, WorkerRating, WorkerService
from .models import AdminActionLog


User = get_user_model()
ACTIVE_BOOKING_STATUSES = ["pending", "confirmed", "accepted", "in_progress"]
BOOKING_STATUS_ALIASES = {"cancelled": "canceled"}
BOOKING_STATUS_VALUES = ["pending", "confirmed", "accepted", "in_progress", "completed", "canceled", "declined"]


def superuser_required(view_func):
    """Backend authorization guard used by every admin operation."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        if not request.user.is_superuser:
            return Response({"error": "Superuser access required"}, status=status.HTTP_403_FORBIDDEN)
        return view_func(request, *args, **kwargs)
    return wrapper


def get_client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    return forwarded.split(",")[0].strip() if forwarded else request.META.get("REMOTE_ADDR")


def log_admin_action(request, action, resource_type, resource_id=None, description=""):
    AdminActionLog.objects.create(
        admin=request.user,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        description=description,
        ip_address=get_client_ip(request),
    )


def _pagination(request, default=20, maximum=100):
    try:
        page = max(int(request.GET.get("page", 1)), 1)
        limit = min(max(int(request.GET.get("limit", request.GET.get("page_size", default))), 1), maximum)
    except (TypeError, ValueError):
        page, limit = 1, default
    return page, limit


def _paginated(queryset, request, serializer):
    page, limit = _pagination(request)
    paginator = Paginator(queryset, limit)
    page_obj = paginator.get_page(page)
    return {
        "items": [serializer(item) for item in page_obj],
        "pagination": {
            "page": page_obj.number,
            "limit": limit,
            "total": paginator.count,
            "pages": paginator.num_pages,
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous(),
        },
    }


def _profile_for(user):
    return getattr(user, "profiles", None)


def _serialize_user(user, include_bookings=False):
    profile = _profile_for(user)
    payload = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": f"{user.first_name} {user.last_name}".strip() or user.username,
        "phone": profile.phone if profile else "",
        "bio": profile.bio if profile else "",
        "address": profile.address if profile else "",
        "city": profile.city if profile else "",
        "postal_code": profile.postal_code if profile else "",
        "country": profile.country if profile else "",
        "date_joined": user.date_joined,
        "last_login": user.last_login,
        "is_active": user.is_active,
        "total_bookings": user.bookings.count(),
    }
    if include_bookings:
        payload["bookings"] = [_serialize_booking(booking) for booking in user.bookings.select_related("worker", "service").all()]
        payload["total_spent"] = float(user.bookings.filter(payment_status="paid").aggregate(total=Sum("amount"))["total"] or 0)
    return payload


def _serialize_review(review):
    return {
        "id": review.id,
        "rating": review.rating,
        "review": review.review or "",
        "moderation_status": review.moderation_status,
        "customer": {"id": review.user_id, "username": review.user.username, "email": review.user.email},
        "worker": {"id": review.worker_id, "name": review.worker.name},
        "created_at": review.created_at,
    }


def _serialize_worker(worker, include_details=False):
    ratings = worker.ratings.filter(moderation_status="approved")
    average = ratings.aggregate(value=Avg("rating"))["value"] or 0
    payload = {
        "id": worker.id,
        "name": worker.name,
        "username": worker.user.username if worker.user else "",
        "email": worker.email or (worker.user.email if worker.user else ""),
        "phone": worker.phone,
        "category": worker.profession.name,
        "profession": worker.profession.name,
        "profession_id": worker.profession_id,
        "location": worker.location,
        "experience": worker.experience,
        "bio": worker.bio,
        "rating": round(float(average), 1),
        "total_ratings": ratings.count(),
        "total_bookings": worker.bookings.count(),
        "booking_count": worker.bookings.count(),
        "is_active": worker.is_active,
        "is_available": worker.is_active,
        "verification_status": worker.verification_status,
        "date_joined": worker.user.date_joined if worker.user else None,
    }
    if include_details:
        payload["services"] = [_serialize_service(service) for service in worker.services.all()]
        payload["ratings_list"] = [_serialize_review(review) for review in worker.ratings.select_related("user").all()]
        payload["bookings"] = [_serialize_booking(booking) for booking in worker.bookings.select_related("user", "service").all()]
        payload["total_earnings"] = float(worker.bookings.filter(payment_status="paid").aggregate(total=Sum("amount"))["total"] or 0)
    return payload


def _serialize_booking(booking):
    total = (booking.amount or Decimal("0")) + (booking.pay_later_fee or Decimal("0"))
    return {
        "id": booking.id,
        "user_name": booking.user.username,
        "worker_name": booking.worker.name,
        "service_name": booking.service.services,
        "scheduled_date": booking.date,
        "scheduled_time": booking.time_slot,
        "booking_status": booking.status,
        "payment_status": booking.payment_status,
        "payment_mode": booking.payment_mode,
        "amount": float(booking.amount or 0),
        "pay_later_fee": float(booking.pay_later_fee or 0),
        "total_amount": float(total),
        "created_at": booking.created_at,
    }


def _serialize_service(service):
    return {
        "id": service.id,
        "worker_id": service.worker_id,
        "worker_name": service.worker.name,
        "service_name": service.services,
        "description": service.description,
        "price": float(service.price),
        "is_active": service.is_active,
    }


def _serialize_payment(payment):
    booking = payment.booking
    return {
        "id": payment.id,
        "booking_id": booking.id,
        "user": {"id": payment.user_id, "username": payment.user.username, "email": payment.user.email},
        "worker": {"id": payment.worker_id, "name": payment.worker.name, "email": payment.worker.email},
        "service": booking.service.services if booking.service else None,
        "amount": float(payment.amount),
        "currency": payment.currency,
        "payment_status": payment.payment_status,
        "refund_status": "refunded" if payment.payment_status == "refunded" else "not_requested",
        "payment_mode": booking.payment_mode,
        "stripe_session_id": payment.stripe_session_id,
        "stripe_payment_intent_id": payment.stripe_payment_intent_id,
        "paid_at": payment.paid_at,
        "created_at": payment.created_at,
        "booking_date": booking.date,
        "booking_time": booking.time_slot,
    }


# Authentication
@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def admin_login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    if not username or not password:
        return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.check_password(password):
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        return Response({"error": "This admin account is inactive"}, status=status.HTTP_403_FORBIDDEN)
    if not user.is_superuser:
        return Response({"error": "You do not have admin access."}, status=status.HTTP_403_FORBIDDEN)
    refresh = RefreshToken.for_user(user)
    return Response({"refresh": str(refresh), "access": str(refresh.access_token), "user": {"id": user.id, "username": user.username, "email": user.email, "is_superuser": user.is_superuser, "is_staff": user.is_staff}})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_logout(request):
    log_admin_action(request, "admin_logout", "auth", description="Admin logged out")
    return Response({"message": "Logged out successfully"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_me(request):
    return Response(_serialize_user(request.user))


# Dashboard
@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_stats(request):
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    customers = User.objects.filter(role="user", is_staff=False, is_superuser=False)
    workers = Worker.objects.select_related("user", "profession")
    bookings = Booking.objects.select_related("user", "worker", "service")
    paid = bookings.filter(payment_status="paid")
    return Response({
        "total_users": customers.count(),
        "total_workers": workers.count(),
        "total_services": WorkerService.objects.count(),
        "total_bookings": bookings.count(),
        "pending_bookings": bookings.filter(status="pending").count(),
        "confirmed_bookings": bookings.filter(status__in=["confirmed", "accepted"]).count(),
        "in_progress_bookings": bookings.filter(status="in_progress").count(),
        "completed_bookings": bookings.filter(status="completed").count(),
        "cancelled_bookings": bookings.filter(status="canceled").count(),
        "total_revenue": float(paid.aggregate(total=Sum("amount"))["total"] or 0),
        "revenue_this_month": float(paid.filter(created_at__gte=month_start).aggregate(total=Sum("amount"))["total"] or 0),
        "new_users_this_month": customers.filter(date_joined__gte=month_start).count(),
        "new_workers_this_month": workers.filter(user__date_joined__gte=month_start).count(),
        "recent_bookings": [_serialize_booking(item) for item in bookings.order_by("-created_at")[:5]],
        "recent_users": [_serialize_user(item) for item in customers.order_by("-date_joined")[:5]],
        "recent_workers": [_serialize_worker(item) for item in workers.order_by("-user__date_joined")[:5]],
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_analytics(request):
    monthly = list(Booking.objects.annotate(month=TruncMonth("created_at")).values("month").annotate(bookings=Count("id"), revenue=Sum("amount")).order_by("month")[-6:])
    series = [{"month": row["month"].strftime("%Y-%m") if row["month"] else None, "bookings": row["bookings"], "revenue": float(row["revenue"] or 0)} for row in monthly]
    recent = [row["bookings"] for row in series[-3:]]
    return Response({"monthly": series, "next_month_booking_forecast": round(sum(recent) / len(recent)) if recent else 0, "forecast_method": "average of the last three months", "top_services": list(WorkerService.objects.values("services").annotate(bookings=Count("bookings")).order_by("-bookings", "services")[:10])})


# Users
@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_users(request):
    users = User.objects.filter(role="user", is_staff=False, is_superuser=False).prefetch_related("profiles")
    search = request.GET.get("search", "").strip()
    active = request.GET.get("is_active")
    if search:
        users = users.filter(Q(username__icontains=search) | Q(email__icontains=search) | Q(first_name__icontains=search) | Q(last_name__icontains=search))
    if active in {"true", "false"}:
        users = users.filter(is_active=active == "true")
    data = _paginated(users.order_by("-date_joined"), request, _serialize_user)
    return Response({"users": data["items"], "pagination": data["pagination"]})


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_user_detail(request, user_id):
    try:
        user = User.objects.get(id=user_id, role="user", is_staff=False, is_superuser=False)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        return Response(_serialize_user(user, include_bookings=True))
    if request.method == "DELETE":
        if user.bookings.exists() or user.payments.exists():
            user.is_active = False
            user.save(update_fields=["is_active"])
            log_admin_action(request, "user_deactivated", "user", user_id, f"User {user.username} retained because they have transaction history")
            return Response({"message": f'User "{user.username}" was deactivated because they have booking or payment history.'})
        username = user.username
        with transaction.atomic():
            user.delete()
        log_admin_action(request, "user_deleted", "user", user_id, f"User {username} deleted")
        return Response({"message": f'User "{username}" deleted successfully'})
    for field in {"email", "first_name", "last_name"}:
        if field in request.data:
            setattr(user, field, request.data[field])
    with transaction.atomic():
        user.save()
        profile, _ = UserProfile.objects.get_or_create(user=user)
        for field in {"phone", "bio", "address", "city", "postal_code", "country"}:
            if field in request.data:
                setattr(profile, field, request.data[field])
        profile.save()
    log_admin_action(request, "user_updated", "user", user_id, f"User {user.username} updated")
    return Response(_serialize_user(user, include_bookings=True))


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_toggle_user_status(request, user_id):
    try:
        user = User.objects.get(id=user_id, role="user", is_staff=False, is_superuser=False)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    user.is_active = not user.is_active
    user.save(update_fields=["is_active"])
    log_admin_action(request, "user_status_updated", "user", user_id, f"User active={user.is_active}")
    return Response({"is_active": user.is_active, "message": "User status updated"})


# Workers
@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_workers(request):
    workers = Worker.objects.select_related("user", "profession").prefetch_related("services", "ratings", "bookings")
    search = request.GET.get("search", "").strip()
    verification = request.GET.get("verification_status") or request.GET.get("status")
    active = request.GET.get("is_active")
    category = request.GET.get("category")
    if search:
        workers = workers.filter(Q(name__icontains=search) | Q(email__icontains=search) | Q(user__username__icontains=search))
    if verification in {"pending", "approved", "rejected"}:
        workers = workers.filter(verification_status=verification)
    if active in {"true", "false"}:
        workers = workers.filter(is_active=active == "true")
    if category:
        workers = workers.filter(profession_id=category)
    data = _paginated(workers.order_by("-user__date_joined"), request, _serialize_worker)
    return Response({"workers": data["items"], "pagination": data["pagination"]})


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_worker_detail(request, worker_id):
    try:
        worker = Worker.objects.select_related("user", "profession").get(id=worker_id)
    except Worker.DoesNotExist:
        return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        return Response(_serialize_worker(worker, include_details=True))
    if request.method == "DELETE":
        name = worker.name
        if worker.bookings.exists() or worker.payments.exists():
            worker.is_active = False
            worker.verification_status = "rejected"
            worker.save(update_fields=["is_active", "verification_status"])
            if worker.user_id:
                worker.user.is_active = False
                worker.user.save(update_fields=["is_active"])
            log_admin_action(request, "worker_deactivated", "worker", worker_id, f"Worker {name} retained because they have transaction history")
            return Response({"message": f'Worker "{name}" was deactivated because they have booking or payment history.'})
        with transaction.atomic():
            worker.delete()
        log_admin_action(request, "worker_deleted", "worker", worker_id, f"Worker {name} deleted")
        return Response({"message": f'Worker "{name}" deleted successfully'})
    for field in {"name", "phone", "email", "experience", "location", "bio", "service_radius_km", "is_active", "verification_status"}:
        if field in request.data:
            setattr(worker, field, request.data[field])
    if "profession_id" in request.data:
        try:
            worker.profession = Profession.objects.get(id=request.data["profession_id"])
        except Profession.DoesNotExist:
            return Response({"error": "Profession not found"}, status=status.HTTP_400_BAD_REQUEST)
    worker.save()
    log_admin_action(request, "worker_updated", "worker", worker_id, f"Worker {worker.name} updated")
    return Response(_serialize_worker(worker, include_details=True))


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_toggle_worker_availability(request, worker_id):
    try:
        worker = Worker.objects.get(id=worker_id)
    except Worker.DoesNotExist:
        return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)
    worker.is_active = not worker.is_active
    worker.save(update_fields=["is_active"])
    log_admin_action(request, "worker_status_updated", "worker", worker_id, f"Worker active={worker.is_active}")
    return Response({"is_active": worker.is_active, "message": "Worker status updated"})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_verify_worker(request, worker_id):
    try:
        worker = Worker.objects.get(id=worker_id)
    except Worker.DoesNotExist:
        return Response({"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND)
    verification_status = request.data.get("verification_status", "approved")
    if verification_status not in {"pending", "approved", "rejected"}:
        return Response({"error": "Invalid worker verification status"}, status=status.HTTP_400_BAD_REQUEST)
    worker.verification_status = verification_status
    if verification_status == "rejected":
        worker.is_active = False
    elif verification_status == "approved" and "is_active" not in request.data:
        worker.is_active = True
    worker.save(update_fields=["verification_status", "is_active"])
    log_admin_action(request, f"worker_{verification_status}", "worker", worker_id, f"Worker verification set to {verification_status}")
    return Response(_serialize_worker(worker))


# Bookings
@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_bookings(request):
    bookings = Booking.objects.select_related("user", "worker", "service").all()
    booking_status = request.GET.get("booking_status") or request.GET.get("status")
    payment_status = request.GET.get("payment_status")
    search = request.GET.get("search", "").strip()
    if booking_status:
        bookings = bookings.filter(status=BOOKING_STATUS_ALIASES.get(booking_status, booking_status))
    if payment_status:
        bookings = bookings.filter(payment_status=payment_status)
    if search:
        bookings = bookings.filter(Q(user__username__icontains=search) | Q(user__email__icontains=search) | Q(worker__name__icontains=search) | Q(worker__email__icontains=search) | Q(service__services__icontains=search) | Q(id__icontains=search))
    for param, lookup in (("date_from", "date__gte"), ("date_to", "date__lte")):
        value = request.GET.get(param)
        if value:
            try:
                bookings = bookings.filter(**{lookup: datetime.strptime(value, "%Y-%m-%d").date()})
            except ValueError:
                return Response({"error": f"Invalid {param}. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
    data = _paginated(bookings.order_by("-created_at"), request, _serialize_booking)
    return Response({"bookings": data["items"], "pagination": data["pagination"]})


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_booking_detail(request, booking_id):
    try:
        booking = Booking.objects.select_related("user", "worker", "worker__profession", "service").get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        payload = _serialize_booking(booking)
        payload.update({"user": _serialize_user(booking.user), "worker": _serialize_worker(booking.worker), "service": {"id": booking.service_id, "name": booking.service.services, "description": booking.service.description, "price": float(booking.service.price), "is_active": booking.service.is_active}, "notes": booking.notes})
        return Response(payload)
    if request.method == "DELETE":
        booking.delete()
        log_admin_action(request, "booking_deleted", "booking", booking_id, f"Booking {booking_id} deleted")
        return Response({"message": "Booking deleted successfully"})
    new_status = request.data.get("status") or request.data.get("booking_status")
    new_status = BOOKING_STATUS_ALIASES.get(new_status, new_status)
    if new_status not in BOOKING_STATUS_VALUES:
        return Response({"error": "Invalid booking status"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        with transaction.atomic():
            booking.status = new_status
            booking.save(update_fields=["status"])
    except IntegrityError:
        return Response({"error": "This slot is already booked."}, status=status.HTTP_409_CONFLICT)
    log_admin_action(request, "booking_status_updated", "booking", booking_id, f"Booking status set to {new_status}")
    return Response(_serialize_booking(booking))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_create_booking(request):
    try:
        user = User.objects.get(id=request.data.get("user_id"), role="user", is_staff=False)
        worker = Worker.objects.get(id=request.data.get("worker_id"))
        service = WorkerService.objects.get(id=request.data.get("service_id"), worker=worker, is_active=True)
        booking_date = datetime.strptime(request.data.get("scheduled_date") or request.data.get("date"), "%Y-%m-%d").date()
        from datetime import time as time_type
        time_slot = time_type.fromisoformat(request.data.get("scheduled_time") or request.data.get("time") or "09:00")
    except (User.DoesNotExist, Worker.DoesNotExist, WorkerService.DoesNotExist):
        return Response({"error": "Invalid user, worker, or service ID"}, status=status.HTTP_400_BAD_REQUEST)
    except (TypeError, ValueError):
        return Response({"error": "Invalid date or time format"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        with transaction.atomic():
            if Booking.objects.filter(worker=worker, date=booking_date, time_slot=time_slot, status__in=ACTIVE_BOOKING_STATUSES).exists():
                return Response({"error": "This slot is already booked."}, status=status.HTTP_409_CONFLICT)
            booking = Booking.objects.create(user=user, worker=worker, service=service, date=booking_date, time_slot=time_slot, status="confirmed", amount=service.price, payment_status="unpaid", notes=request.data.get("notes", ""))
    except IntegrityError:
        return Response({"error": "This slot is already booked."}, status=status.HTTP_409_CONFLICT)
    log_admin_action(request, "booking_created", "booking", booking.id, f"Booking created for {user.username} with {worker.name}")
    return Response({"message": "Booking created successfully", "booking": _serialize_booking(booking)}, status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_cancel_booking(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
    if booking.status in {"completed", "canceled"}:
        return Response({"error": "This booking cannot be canceled"}, status=status.HTTP_400_BAD_REQUEST)
    reason = request.data.get("reason", "Cancelled by admin")
    booking.status = "canceled"
    booking.notes = f"{booking.notes or ''}\n\nCancellation reason: {reason}".strip()
    booking.save(update_fields=["status", "notes"])
    log_admin_action(request, "booking_cancelled", "booking", booking_id, f"Booking cancelled: {reason}")
    return Response({"message": "Booking cancelled successfully", "booking_status": booking.status, "refund_status": "manual_review_required" if booking.payment_status == "paid" else "not_applicable"})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_update_booking_status(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
    new_status = request.data.get("status") or request.data.get("booking_status")
    new_status = BOOKING_STATUS_ALIASES.get(new_status, new_status)
    if new_status not in BOOKING_STATUS_VALUES:
        return Response({"error": "Invalid booking status"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        with transaction.atomic():
            booking.status = new_status
            booking.save(update_fields=["status"])
    except IntegrityError:
        return Response({"error": "This slot is already booked."}, status=status.HTTP_409_CONFLICT)
    log_admin_action(request, "booking_status_updated", "booking", booking_id, f"Booking status set to {new_status}")
    return Response(_serialize_booking(booking))


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_delete_booking(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
    # Keep booking/payment history intact. DELETE is treated as an admin
    # cancellation because hard-deleting a booking would cascade its payments.
    booking.status = "canceled"
    booking.notes = f"{booking.notes or ''}\n\nCancelled by administrator".strip()
    booking.save(update_fields=["status", "notes"])
    log_admin_action(request, "booking_cancelled", "booking", booking_id, f"Booking {booking_id} cancelled via delete endpoint")
    return Response({"message": "Booking cancelled and retained for audit history", "booking_status": booking.status})


# Services
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_services(request):
    if request.method == "POST":
        try:
            worker = Worker.objects.get(id=request.data.get("worker_id"))
            price = Decimal(str(request.data.get("price")))
            if price < Decimal("100.00"):
                raise InvalidOperation
            service = WorkerService.objects.create(worker=worker, services=request.data.get("services") or request.data.get("name"), description=request.data.get("description", ""), price=price)
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found"}, status=status.HTTP_400_BAD_REQUEST)
        except (InvalidOperation, TypeError, ValueError):
            return Response({"error": "Price must be at least ₹100."}, status=status.HTTP_400_BAD_REQUEST)
        log_admin_action(request, "service_created", "service", service.id, f"Service {service.services} created")
        return Response(_serialize_service(service), status=status.HTTP_201_CREATED)
    services = WorkerService.objects.select_related("worker").all()
    search = request.GET.get("search", "").strip()
    active = request.GET.get("is_active")
    if search:
        services = services.filter(Q(services__icontains=search) | Q(worker__name__icontains=search))
    if active in {"true", "false"}:
        services = services.filter(is_active=active == "true")
    return Response({"services": [_serialize_service(service) for service in services.order_by("services", "id")]})


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_service_detail(request, service_id):
    try:
        service = WorkerService.objects.select_related("worker").get(id=service_id)
    except WorkerService.DoesNotExist:
        return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        return Response(_serialize_service(service))
    if request.method == "DELETE":
        name = service.services
        if service.bookings.exists():
            service.is_active = False
            service.save(update_fields=["is_active"])
            log_admin_action(request, "service_deactivated", "service", service_id, f"Service {name} retained because it has booking history")
            return Response({"message": f'Service "{name}" was deactivated because it has booking history.'})
        service.delete()
        log_admin_action(request, "service_deleted", "service", service_id, f"Service {name} deleted")
        return Response({"message": f'Service "{name}" deleted successfully'})
    for field in ["services", "description", "is_active"]:
        if field in request.data:
            setattr(service, field, request.data[field])
    if "name" in request.data:
        service.services = request.data["name"]
    if "price" in request.data:
        try:
            service.price = Decimal(str(request.data["price"]))
            if service.price < Decimal("100.00"):
                raise InvalidOperation
        except (InvalidOperation, TypeError, ValueError):
            return Response({"error": "Price must be at least ₹100."}, status=status.HTTP_400_BAD_REQUEST)
    service.save()
    log_admin_action(request, "service_updated", "service", service_id, f"Service {service.services} updated")
    return Response(_serialize_service(service))


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_toggle_service(request, service_id):
    try:
        service = WorkerService.objects.get(id=service_id)
    except WorkerService.DoesNotExist:
        return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)
    service.is_active = not service.is_active
    service.save(update_fields=["is_active"])
    log_admin_action(request, "service_status_updated", "service", service_id, f"Service active={service.is_active}")
    return Response({"is_active": service.is_active, "message": "Service status updated"})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_delete_service(request, service_id):
    return admin_service_detail(request, service_id)


# Reviews
@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_reviews(request):
    reviews = WorkerRating.objects.select_related("user", "worker").all()
    search = request.GET.get("search", "").strip()
    moderation = request.GET.get("moderation_status")
    rating = request.GET.get("rating")
    if search:
        reviews = reviews.filter(Q(review__icontains=search) | Q(user__username__icontains=search) | Q(worker__name__icontains=search))
    if moderation:
        reviews = reviews.filter(moderation_status=moderation)
    if rating in {"1", "2", "3", "4", "5"}:
        reviews = reviews.filter(rating=int(rating))
    data = _paginated(reviews.order_by("-created_at"), request, _serialize_review)
    return Response({"reviews": data["items"], "pagination": data["pagination"]})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_delete_review(request, review_id):
    try:
        review = WorkerRating.objects.get(id=review_id)
    except WorkerRating.DoesNotExist:
        return Response({"error": "Review not found"}, status=status.HTTP_404_NOT_FOUND)
    review.moderation_status = "removed"
    review.moderation_reason = "Removed by administrator"
    review.review = ""
    review.save(update_fields=["moderation_status", "moderation_reason", "review"])
    log_admin_action(request, "review_removed", "review", review_id, "Review removed by administrator")
    return Response({"message": "Review removed successfully"})


# Payments
@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_payments(request):
    payments = Payment.objects.select_related("booking", "booking__service", "user", "worker").all()
    payment_status = request.GET.get("payment_status")
    payment_mode = request.GET.get("payment_mode")
    search = request.GET.get("search", "").strip()
    if payment_status:
        payments = payments.filter(payment_status=payment_status)
    if payment_mode:
        payments = payments.filter(booking__payment_mode=payment_mode)
    if search:
        payments = payments.filter(Q(user__username__icontains=search) | Q(worker__name__icontains=search) | Q(booking__id__icontains=search))
    data = _paginated(payments.order_by("-created_at"), request, _serialize_payment)
    return Response({"payments": data["items"], "pagination": data["pagination"], "stats": {"total_payments": payments.count(), "paid_amount": float(payments.filter(payment_status="paid").aggregate(total=Sum("amount"))["total"] or 0), "pending_amount": float(payments.filter(payment_status="pending").aggregate(total=Sum("amount"))["total"] or 0), "failed_amount": float(payments.filter(payment_status="failed").aggregate(total=Sum("amount"))["total"] or 0)}})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_payment_detail(request, payment_id):
    try:
        payment = Payment.objects.select_related("booking", "booking__service", "user", "worker").get(id=payment_id)
    except Payment.DoesNotExist:
        return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response(_serialize_payment(payment))
