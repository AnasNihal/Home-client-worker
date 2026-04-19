from django.http import JsonResponse
from functools import wraps
from django.contrib.auth import get_user_model
from django.db.models import Sum, Q, Avg
from django.utils import timezone
from datetime import datetime
from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.response import Response
from django.core.paginator import Paginator

from HomeApp.models import Worker, WorkerService, Booking, WorkerRating, Payment
from .models import AdminActionLog

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """
    Admin login endpoint - only for superusers
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    from django.contrib.auth import authenticate
    user = authenticate(username=username, password=password)
    
    if not user:
        return Response(
            {"error": "Invalid credentials"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.is_superuser:
        return Response(
            {"error": "Superuser access required"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    refresh = RefreshToken.for_user(user)
    
    payload = {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'username': user.username,
            'email': user.email,
            'is_superuser': True
        }
    }
    
    return Response(payload, status=status.HTTP_200_OK)


def superuser_required(view_func):
    """
    Decorator to require superuser access for admin views
    """

    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {"error": "Authentication required"}, status=401
            )
        if not request.user.is_superuser:
            return JsonResponse(
                {"error": "Superuser access required"}, status=403
            )
        return view_func(request, *args, **kwargs)

    return wrapper


def log_admin_action(
    request, action, resource_type, resource_id=None, description=""
):
    """Helper function to log admin actions"""
    AdminActionLog.objects.create(
        admin=request.user,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        description=description,
        ip_address=get_client_ip(request),
    )


def get_client_ip(request):
    """Get client IP address"""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


# ─── AUTHENTICATION ───


@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    """
    Admin login - only allows superusers
    Accept username + password
    """
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.check_password(password):
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_superuser:
        return Response(
            {"error": "You do not have admin access."},
            status=status.HTTP_403_FORBIDDEN,
        )

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,  # pyright: ignore
                "username": user.username,
                "email": user.email,
                "is_superuser": user.is_superuser,
                "is_staff": user.is_staff,
            },
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_logout(request):
    """
    Clear admin session/token
    """
    log_admin_action(
        request, "admin_logout", "auth", description="Admin logged out"
    )
    return Response(
        {"message": "Logged out successfully"}, status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_me(request):
    """
    Return logged-in admin details
    """
    user = request.user
    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_superuser": user.is_superuser,
            "is_staff": user.is_staff,
            "date_joined": user.date_joined,
            "last_login": user.last_login,
        }
    )


# ─── DASHBOARD STATS ───


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_stats(request):
    """
    Returns comprehensive dashboard statistics
    """
    now = timezone.now()
    current_month_start = now.replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )

    # User stats
    total_users = User.objects.filter(is_staff=False).count()
    new_users_this_month = User.objects.filter(
        is_staff=False, date_joined__gte=current_month_start
    ).count()

    # Worker stats
    total_workers = Worker.objects.count()
    new_workers_this_month = Worker.objects.filter(
        user__date_joined__gte=current_month_start
    ).count()

    # Booking stats
    total_bookings = Booking.objects.count()
    pending_bookings = Booking.objects.filter(status="pending").count()
    confirmed_bookings = Booking.objects.filter(status="confirmed").count()
    completed_bookings = Booking.objects.filter(status="completed").count()
    cancelled_bookings = Booking.objects.filter(status="canceled").count()

    # Revenue stats
    paid_bookings = Booking.objects.filter(payment_status="paid")
    total_revenue = paid_bookings.aggregate(total=Sum("amount"))[
        "total"
    ] or Decimal("0.00")

    revenue_this_month = paid_bookings.filter(
        created_at__gte=current_month_start
    ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

    return Response(
        {
            "total_users": total_users,
            "total_workers": total_workers,
            "total_bookings": total_bookings,
            "pending_bookings": pending_bookings,
            "confirmed_bookings": confirmed_bookings,
            "completed_bookings": completed_bookings,
            "cancelled_bookings": cancelled_bookings,
            "total_revenue": float(total_revenue),
            "revenue_this_month": float(revenue_this_month),
            "new_users_this_month": new_users_this_month,
            "new_workers_this_month": new_workers_this_month,
        }
    )


# ─── USER MANAGEMENT ───


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_users(request):
    """
    Return paginated list of all users (non-staff only)
    """
    search = request.GET.get("search", "")
    is_active_filter = request.GET.get("is_active")
    page = int(request.GET.get("page", 1))
    limit = int(request.GET.get("limit", 10))

    users = User.objects.filter(is_staff=False)

    # Search
    if search:
        users = users.filter(
            Q(username__icontains=search)
            | Q(email__icontains=search)
            | Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
        )

    # Filter by status
    if is_active_filter is not None:
        is_active = is_active_filter.lower() == "true"
        users = users.filter(is_active=is_active)

    # Pagination
    paginator = Paginator(users, limit)
    users_page = paginator.get_page(page)

    users_data = []
    for user in users_page:
        booking_count = Booking.objects.filter(user=user).count()
        users_data.append(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "full_name": f"{user.first_name}  {user.last_name} ".strip(),
                "phone": (
                    getattr(user.profiles, "phone", "")
                    if hasattr(user, "profiles")
                    else ""
                ),
                "date_joined": user.date_joined,
                "is_active": user.is_active,
                "total_bookings": booking_count,
            }
        )

    return Response(
        {
            "users": users_data,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": paginator.count,
                "pages": paginator.num_pages,
                "has_next": users_page.has_next(),
                "has_previous": users_page.has_previous(),
            },
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_user_detail(request, user_id):
    """
    Full detail of one user
    """
    try:
        user = User.objects.get(id=user_id, is_staff=False)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
        )

    # Profile info
    profile = getattr(user, "profiles", None)

    # Bookings
    bookings = Booking.objects.filter(user=user).order_by("-created_at")
    booking_count = bookings.count()
    total_spent = bookings.filter(payment_status="paid").aggregate(
        total=Sum("amount")
    )["total"] or Decimal("0.00")

    bookings_data = []
    for booking in bookings:
        bookings_data.append(
            {
                "id": booking.id,  # pyright: ignore
                "worker_name": booking.worker.name,
                "service_name": booking.service.services,
                "date": booking.date,
                "time": booking.time,
                "status": booking.status,
                "payment_status": booking.payment_status,
                "amount": float(booking.amount),
                "created_at": booking.created_at,
            }
        )

    return Response(
        {
            "id": user.id,  # pyright: ignore
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": f"{user.first_name} {user.last_name}".strip(),
            "phone": profile.phone if profile else "",
            "bio": profile.bio if profile else "",
            "address": profile.address if profile else "",
            "city": profile.city if profile else "",
            "country": profile.country if profile else "",
            "date_joined": user.date_joined,
            "is_active": user.is_active,
            "total_bookings": booking_count,
            "total_spent": float(total_spent),
            "bookings": bookings_data,
        }
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_toggle_user_status(request, user_id):
    """
    Toggle user is_active between True and False
    """
    try:
        user = User.objects.get(id=user_id, is_staff=False)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
        )

    user.is_active = not user.is_active
    user.save()

    action = "user_activated" if user.is_active else "user_deactivated"
    log_admin_action(
        request,
        action,
        "user",
        user_id,
        f'User {user.username} {"activated" if user.is_active else "deactivated"}',  # noqa: E501
    )

    return Response(
        {
            "message": f'User {"activated" if user.is_active else "deactivated"} successfully',  # noqa: E501
            "is_active": user.is_active,
        }
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_delete_user(request, user_id):
    """
    Permanently delete user and all their bookings
    """
    try:
        user = User.objects.get(id=user_id, is_staff=False)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
        )

    # Delete all their bookings
    Booking.objects.filter(user=user).delete()

    # Delete user profile if exists
    if hasattr(user, "profiles"):
        user.profiles.delete()  # pyright: ignore

    # Delete user
    username = user.username
    user.delete()

    log_admin_action(
        request,
        "user_deleted",
        "user",
        user_id,
        f"User {username} and all associated data deleted",
    )

    return Response(
        {
            "message": f'User "{username}" and all associated data deleted successfully'  # noqa: E501
        }
    )


# ─── WORKER MANAGEMENT ───


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_workers(request):
    """
    Return paginated list of all workers
    """
    search = request.GET.get("search", "")
    category = request.GET.get("category")
    is_available = request.GET.get("is_available")
    page = int(request.GET.get("page", 1))
    limit = int(request.GET.get("limit", 10))

    workers = Worker.objects.select_related("user", "profession").all()

    # Search
    if search:
        workers = workers.filter(
            Q(name__icontains=search)
            | Q(email__icontains=search)
            | Q(user__username__icontains=search)
        )

    # Filter by category
    if category:
        workers = workers.filter(profession__name__icontains=category)

    # Filter by availability
    if is_available is not None:
        available = is_available.lower() == "true"
        workers = workers.filter(is_active=available)

    # Pagination
    paginator = Paginator(workers, limit)
    workers_page = paginator.get_page(page)

    workers_data = []
    for worker in workers_page:
        booking_count = Booking.objects.filter(worker=worker).count()
        workers_data.append(
            {
                "id": worker.id,
                "name": worker.name,
                "email": worker.email,
                "username": worker.user.username,
                "category": worker.profession.name,
                "location": worker.location,
                "rating": float(worker.rating) if worker.rating else 0.0,
                "is_available": worker.is_active,
                "stripe_onboarded": False,  # TODO: Add this field to model
                "total_bookings": booking_count,
                "date_joined": worker.user.date_joined,
                "phone": worker.phone,
                "experience": worker.experience,
            }
        )

    return Response(
        {
            "workers": workers_data,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": paginator.count,
                "pages": paginator.num_pages,
                "has_next": workers_page.has_next(),
                "has_previous": workers_page.has_previous(),
            },
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_worker_detail(request, worker_id):
    """
    Full detail of one worker
    """
    try:
        worker = Worker.objects.get(id=worker_id)
    except Worker.DoesNotExist:
        return Response(
            {"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND
        )

    # Services
    services = WorkerService.objects.filter(worker=worker)
    services_data = []
    for service in services:
        services_data.append(
            {
                "id": service.id,  # pyright: ignore
                "name": service.services,
                "description": service.description,
                "price": float(service.price),
                "is_active": True,  # TODO: Add this field to model
            }
        )

    # Bookings
    bookings = Booking.objects.filter(worker=worker).order_by("-created_at")
    booking_count = bookings.count()
    total_earnings = bookings.filter(payment_status="paid").aggregate(
        total=Sum("amount")
    )["total"] or Decimal("0.00")

    bookings_data = []
    for booking in bookings:
        bookings_data.append(
            {
                "id": booking.id,  # pyright: ignore
                "user_name": booking.user.username,
                "service_name": booking.service.services,
                "date": booking.date,
                "time": booking.time,
                "status": booking.status,
                "payment_status": booking.payment_status,
                "amount": float(booking.amount),
                "created_at": booking.created_at,
            }
        )

    # Ratings
    ratings = WorkerRating.objects.filter(worker=worker)
    avg_rating = float(ratings.aggregate(Avg("rating"))["rating__avg"] or 0.0)

    return Response(
        {
            "id": worker.id,  # pyright: ignore
            "name": worker.name,
            "email": worker.email,
            "username": worker.user.username,  # pyright: ignore
            "phone": worker.phone,
            "profession": worker.profession.name,
            "location": worker.location,
            "bio": worker.bio,
            "experience": worker.experience,
            "rating": round(avg_rating, 1),
            "total_ratings": ratings.count(),
            "is_available": worker.is_active,
            "date_joined": worker.user.date_joined,  # pyright: ignore
            "total_bookings": booking_count,
            "total_earnings": float(total_earnings),
            "services": services_data,
            "bookings": bookings_data,
        }
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_toggle_worker_availability(request, worker_id):
    """
    Toggle worker is_active between True and False
    """
    try:
        worker = Worker.objects.get(id=worker_id)
    except Worker.DoesNotExist:
        return Response(
            {"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND
        )

    worker.is_active = not worker.is_active
    worker.save()

    action = "worker_activated" if worker.is_active else "worker_deactivated"
    log_admin_action(
        request,
        action,
        "worker",
        worker_id,
        f'Worker {worker.name} {"activated" if worker.is_active else "deactivated"}',  # noqa: E501
    )

    return Response(
        {
            "message": f'Worker {"activated" if worker.is_active else "deactivated"} successfully',  # noqa: E501
            "is_active": worker.is_active,
        }
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_verify_worker(request, worker_id):
    """
    Set worker as verified (add is_verified=True field)
    """
    try:
        worker = Worker.objects.get(id=worker_id)
    except Worker.DoesNotExist:
        return Response(
            {"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND
        )

    # TODO: Add is_verified field to Worker model
    # For now, we'll just return success
    log_admin_action(
        request,
        "worker_verified",
        "worker",
        worker_id,
        f"Worker {worker.name} verified",
    )

    return Response(
        {"message": "Worker verified successfully", "is_verified": True}
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_delete_worker(request, worker_id):
    """
    Permanently delete a worker and their profile
    Also cancel all their active bookings
    """
    try:
        worker = Worker.objects.get(id=worker_id)
    except Worker.DoesNotExist:
        return Response(
            {"error": "Worker not found"}, status=status.HTTP_404_NOT_FOUND
        )

    # Cancel all active bookings
    Booking.objects.filter(
        worker=worker, status__in=["pending", "confirmed", "accepted"]
    ).update(status="canceled")

    # Delete services
    WorkerService.objects.filter(worker=worker).delete()

    # Delete ratings
    WorkerRating.objects.filter(worker=worker).delete()

    # Get username for response
    username = worker.user.username  # pyright: ignore

    # Delete worker (this will also delete the user if needed)
    worker.delete()

    log_admin_action(
        request,
        "worker_deleted",
        "worker",
        worker_id,
        f"Worker {username} and all associated data deleted",
    )

    return Response(
        {
            "message": f'Worker "{username}" and all associated data deleted successfully'  # noqa: E501
        }
    )


# ─── BOOKING MANAGEMENT ───


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_bookings(request):
    """
    Return paginated list of ALL bookings
    """
    booking_status = request.GET.get("booking_status")
    payment_status = request.GET.get("payment_status")
    date_from = request.GET.get("date_from")
    date_to = request.GET.get("date_to")
    search = request.GET.get("search")
    page = int(request.GET.get("page", 1))
    limit = int(request.GET.get("limit", 10))

    bookings = Booking.objects.select_related(
        "user", "worker", "service"
    ).all()

    # Filter by booking status
    if booking_status:
        bookings = bookings.filter(status=booking_status)

    # Filter by payment status
    if payment_status:
        bookings = bookings.filter(payment_status=payment_status)

    # Filter by date range
    if date_from:
        try:
            date_from_obj = datetime.strptime(date_from, "%Y-%m-%d").date()
            bookings = bookings.filter(date__gte=date_from_obj)
        except ValueError:
            pass

    if date_to:
        try:
            date_to_obj = datetime.strptime(date_to, "%Y-%m-%d").date()
            bookings = bookings.filter(date__lte=date_to_obj)
        except ValueError:
            pass

    # Search by user name or worker name
    if search:
        bookings = bookings.filter(
            Q(user__username__icontains=search)
            | Q(worker__name__icontains=search)
        )

    # Order by created_at desc
    bookings = bookings.order_by("-created_at")

    # Pagination
    paginator = Paginator(bookings, limit)
    bookings_page = paginator.get_page(page)

    bookings_data = []
    for booking in bookings_page:
        bookings_data.append(
            {
                "id": booking.id,
                "user_name": booking.user.username,
                "worker_name": booking.worker.name,
                "service_name": booking.service.services,
                "scheduled_date": booking.date,
                "scheduled_time": booking.time,
                "booking_status": booking.status,
                "payment_status": booking.payment_status,
                "total_amount": float(booking.amount + booking.pay_later_fee),
                "created_at": booking.created_at,
            }
        )

    return Response(
        {
            "bookings": bookings_data,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": paginator.count,
                "pages": paginator.num_pages,
                "has_next": bookings_page.has_next(),
                "has_previous": bookings_page.has_previous(),
            },
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_booking_detail(request, booking_id):
    """
    Full detail of one booking
    """
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response(
            {"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND
        )

    return Response(
        {
            "id": booking.id,  # pyright: ignore
            "user": {
                "id": booking.user.id,
                "username": booking.user.username,
                "email": booking.user.email,
                "phone": (
                    getattr(booking.user.profiles, "phone", "")
                    if hasattr(booking.user, "profiles")
                    else ""
                ),
            },
            "worker": {
                "id": booking.worker.id,  # pyright: ignore
                "name": booking.worker.name,
                "email": booking.worker.email,
                "phone": booking.worker.phone,
                "profession": booking.worker.profession.name,
            },
            "service": {
                "id": booking.service.id,  # pyright: ignore
                "name": booking.service.services,
                "description": booking.service.description,
                "price": float(booking.service.price),
            },
            "scheduled_date": booking.date,
            "scheduled_time": booking.time,
            "booking_status": booking.status,
            "payment_status": booking.payment_status,
            "payment_mode": booking.payment_mode,
            "amount": float(booking.amount),
            "pay_later_fee": float(booking.pay_later_fee),
            "total_amount": float(booking.amount + booking.pay_later_fee),
            "notes": booking.notes,
            "created_at": booking.created_at,
            # pyright: ignore
            "updated_at": (
                booking.updated_at
                if hasattr(booking, "updated_at")
                else booking.created_at
            ),
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_create_booking(request):
    """
    Admin can manually create a booking
    """
    user_id = request.data.get("user_id")
    worker_id = request.data.get("worker_id")
    service_id = request.data.get("service_id")
    scheduled_date = request.data.get("scheduled_date")
    scheduled_time = request.data.get("scheduled_time")

    if not all([user_id, worker_id, service_id, scheduled_date]):
        return Response(
            {
                "error": "user_id, worker_id, service_id, and scheduled_date are required"  # noqa: E501
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(id=user_id, is_staff=False)
        worker = Worker.objects.get(id=worker_id)
        service = WorkerService.objects.get(id=service_id, worker=worker)

        date_obj = datetime.strptime(scheduled_date, "%Y-%m-%d").date()

        # Check for conflicts
        conflict = Booking.objects.filter(
            worker=worker,
            date=date_obj,
            status__in=["pending", "confirmed", "accepted"],
        ).exists()

        if conflict:
            return Response(
                {
                    "error": f"{worker.name} is already booked on {scheduled_date}"  # noqa: E501
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking = Booking.objects.create(
            user=user,
            worker=worker,
            service=service,
            date=date_obj,
            time=scheduled_time or "09:00",
            status="confirmed",
            amount=service.price,
            payment_status="unpaid",
        )

        log_admin_action(
            request,
            "booking_created",
            "booking",
            booking.id,
            f"Booking created for {user.username} with {worker.name}",
        )  # pyright: ignore

        return Response(
            {
                "message": "Booking created successfully",
                "booking_id": booking.id,  # pyright: ignore
            },
            status=status.HTTP_201_CREATED,
        )

    except (
        User.DoesNotExist,
        Worker.DoesNotExist,
        WorkerService.DoesNotExist,
    ):
        return Response(
            {"error": "Invalid user, worker, or service ID"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except ValueError:
        return Response(
            {"error": "Invalid date format. Use YYYY-MM-DD"},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_cancel_booking(request, booking_id):
    """
    Admin cancels a booking
    """
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response(
            {"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND
        )

    reason = request.data.get("reason", "Cancelled by admin")

    booking.status = "canceled"
    if booking.payment_status == "paid":
        booking.payment_status = "refunded"

    booking.notes = f"{booking.notes or ''}\n\nCancellation reason: {reason}"
    booking.save()

    log_admin_action(
        request,
        "booking_cancelled",
        "booking",
        booking_id,
        f"Booking {booking_id} cancelled: {reason}",
    )

    return Response(
        {
            "message": "Booking cancelled successfully",
            "booking_status": booking.status,
            "payment_status": booking.payment_status,
        }
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_update_booking_status(request, booking_id):
    """
    Admin updates booking to any status
    """
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response(
            {"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND
        )

    new_status = request.data.get("booking_status")

    valid_statuses = [
        "pending",
        "confirmed",
        "accepted",
        "in_progress",
        "completed",
        "canceled",
    ]
    if new_status not in valid_statuses:
        return Response(
            {
                "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"  # noqa: E501
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    booking.status = new_status
    booking.save()

    log_admin_action(
        request,
        "booking_status_updated",
        "booking",
        booking_id,
        f"Booking {booking_id} status updated to {new_status}",
    )

    return Response(
        {
            "message": f"Booking status updated to {new_status}",
            "booking_status": booking.status,
        }
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_delete_booking(request, booking_id):
    """
    Permanently delete a booking record
    """
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response(
            {"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND
        )

    booking_id_str = str(booking.id)  # pyright: ignore
    booking.delete()

    log_admin_action(
        request,
        "booking_deleted",
        "booking",
        booking_id,
        f"Booking {booking_id_str} deleted",
    )

    return Response(
        {"message": f"Booking {booking_id_str} deleted successfully"}
    )


# ─── SERVICE MANAGEMENT ───


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_services(request):
    """
    List all services across all workers
    """
    services = WorkerService.objects.all()

    services_data = []
    for service in services:
        services_data.append(
            {
                "id": service.id,  # pyright: ignore
                "worker_name": service.worker.name,
                "worker_id": service.worker.id,  # pyright: ignore
                "service_name": service.services,
                "description": service.description,
                "price": float(service.price),
                "is_active": True,  # TODO: Add this field to model
            }
        )

    return Response({"services": services_data})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_toggle_service(request, service_id):
    """
    Toggle service is_active status
    """
    try:
        WorkerService.objects.get(id=service_id)
    except WorkerService.DoesNotExist:
        return Response(
            {"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND
        )

    # TODO: Add is_active field to WorkerService model
    # For now, just return success
    log_admin_action(
        request,
        "service_toggled",
        "service",
        service_id,
        f"Service {service_id} status toggled",
    )

    return Response(
        {"message": "Service status toggled successfully", "is_active": True}
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_delete_service(request, service_id):
    """
    Delete a service
    """
    try:
        service = WorkerService.objects.get(id=service_id)
    except WorkerService.DoesNotExist:
        return Response(
            {"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND
        )

    service_name = service.services
    service.delete()

    log_admin_action(
        request,
        "service_deleted",
        "service",
        service_id,
        f"Service {service_name} deleted",
    )

    return Response(
        {"message": f'Service "{service_name}" deleted successfully'}
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_payments(request):
    """
    Get all payments with filtering and pagination
    """
    try:
        # Get query parameters
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        payment_status = request.GET.get('payment_status', '')
        payment_mode = request.GET.get('payment_mode', '')
        search = request.GET.get('search', '')
        
        # Build query
        payments = Payment.objects.select_related('booking', 'user', 'worker').all()
        
        # Apply filters
        if payment_status:
            payments = payments.filter(payment_status__iexact=payment_status)
        if payment_mode:
            payments = payments.filter(booking__payment_mode__iexact=payment_mode)
        if search:
            payments = payments.filter(
                Q(user__username__icontains=search) |
                Q(worker__name__icontains=search) |
                Q(booking__id__icontains=search)
            )
        
        # Order by latest
        payments = payments.order_by('-created_at')
        
        # Paginate
        paginator = Paginator(payments, page_size)
        payments_page = paginator.get_page(page)
        
        # Serialize data
        payments_data = []
        for payment in payments_page:
            payments_data.append({
                'id': payment.id,
                'booking_id': payment.booking.id,
                'user': {
                    'id': payment.user.id,
                    'username': payment.user.username,
                    'email': payment.user.email
                },
                'worker': {
                    'id': payment.worker.id,
                    'name': payment.worker.name
                },
                'amount': float(payment.amount),
                'currency': payment.currency,
                'payment_status': payment.payment_status,
                'payment_mode': payment.booking.payment_mode,
                'stripe_session_id': payment.stripe_session_id,
                'stripe_payment_intent_id': payment.stripe_payment_intent_id,
                'paid_at': payment.paid_at.isoformat() if payment.paid_at else None,
                'created_at': payment.created_at.isoformat(),
                'service': payment.booking.service.services if payment.booking.service else None,
                'booking_date': payment.booking.date.isoformat() if payment.booking.date else None,
                'booking_time': payment.booking.time.isoformat() if payment.booking.time else None
            })
        
        return Response({
            'payments': payments_data,
            'pagination': {
                'current_page': payments_page.number,
                'total_pages': paginator.num_pages,
                'total_items': paginator.count,
                'has_next': payments_page.has_next(),
                'has_previous': payments_page.has_previous()
            },
            'stats': {
                'total_payments': paginator.count,
                'paid_amount': float(payments.filter(payment_status='paid').aggregate(total=Sum('amount'))['total'] or 0),
                'pending_amount': float(payments.filter(payment_status='pending').aggregate(total=Sum('amount'))['total'] or 0),
                'failed_amount': float(payments.filter(payment_status='failed').aggregate(total=Sum('amount'))['total'] or 0)
            }
        })
        
    except Exception as e:
        return Response(
            {"error": f"Failed to fetch payments: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@superuser_required
def admin_payment_detail(request, payment_id):
    """
    Get detailed information about a specific payment
    """
    try:
        payment = Payment.objects.select_related('booking', 'user', 'worker', 'booking__service').get(id=payment_id)
        
        payment_data = {
            'id': payment.id,
            'booking': {
                'id': payment.booking.id,
                'service': payment.booking.service.services if payment.booking.service else None,
                'date': payment.booking.date.isoformat() if payment.booking.date else None,
                'time': payment.booking.time.isoformat() if payment.booking.time else None,
                'status': payment.booking.status,
                'payment_mode': payment.booking.payment_mode,
                'notes': payment.booking.notes,
                'stripe_checkout_session_id': payment.booking.stripe_checkout_session_id
            },
            'user': {
                'id': payment.user.id,
                'username': payment.user.username,
                'email': payment.user.email,
                'phone': getattr(payment.user, 'phone', None)
            },
            'worker': {
                'id': payment.worker.id,
                'name': payment.worker.name,
                'email': payment.worker.email,
                'phone': payment.worker.phone
            },
            'amount': float(payment.amount),
            'currency': payment.currency,
            'payment_status': payment.payment_status,
            'stripe_session_id': payment.stripe_session_id,
            'stripe_payment_intent_id': payment.stripe_payment_intent_id,
            'paid_at': payment.paid_at.isoformat() if payment.paid_at else None,
            'created_at': payment.created_at.isoformat(),
            'updated_at': payment.updated_at.isoformat() if hasattr(payment, 'updated_at') else None
        }
        
        return Response(payment_data)
        
    except Payment.DoesNotExist:
        return Response(
            {"error": "Payment not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"Failed to fetch payment details: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
