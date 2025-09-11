from django.shortcuts import render,get_object_or_404
from rest_framework.decorators import api_view,permission_classes,parser_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response 
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Avg
from .serializers  import (
    ProfessionSerializer,
    UserRegistrationSerializer,
    UserProfileSerializer,
    WorkerRegistrationSerializer,
    WorkerServiceSerializer,
    WorkerSerializer,
    LoginSerializer,
    BookingSerializer
    )
from rest_framework import status
from django.contrib.auth import authenticate
from .models import Profession, UserProfile, Worker, WorkerService,WorkerRating ,Booking
from django.core.mail import send_mail



@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)

    if not user:
        return Response({"detail": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)

    payload = {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'role': user.role.lower(),   # 👈 always lower-case ("user"/"worker")
        'username': user.username
    }
    return Response(payload, status=status.HTTP_200_OK)

    
@api_view(['POST'])
@permission_classes([AllowAny])
def user_register(request):
    serializer = UserRegistrationSerializer(data = request.data)
    if serializer.is_valid():
        user  = serializer.save()
        return Response({'message':'User Registered'},status=status.HTTP_200_OK)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
                    

@api_view(['GET','PUT'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser]) 
def user_profile(request):
    if request.user.is_anonymous:
        return Response({"detail": "Authentication required"}, status=401)

    # 🚫 Prevent workers from auto-creating a UserProfile
    if request.user.role.lower() != "user":
        return Response({"detail": "Only normal users can access profile"}, status=403)

    try:
        profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response({"detail": "Profile not found"}, status=404)

    if request.method == 'GET':
        serializer = UserProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            instance = serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    
# Worker Setup --- >>

@api_view(['POST'])
@permission_classes([AllowAny])
def worker_register(request):
    serializer = WorkerRegistrationSerializer( data = request.data)
    if serializer.is_valid():
       serializer.save()
       return Response({'message':"Worker Registered"},status=status.HTTP_200_OK)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def worker_dashboard(request):
    if request.user.role.lower() != "worker":
        return Response({"detail": "Only workers can access this page"}, status=403)

    worker = get_object_or_404(Worker, user=request.user)

    if request.method == 'GET':
        # Serialize worker basic info
        worker_data = WorkerSerializer(worker).data  

        # Get all bookings for this worker
        bookings = Booking.objects.filter(worker=worker).select_related("user", "service")
        bookings_data = [
            {
                "id": b.id,
                "user_name": b.user.username,
                "services": [b.service.services],  # corrected field name
                "date": b.date,
                "time": b.time,
                "status": b.status,
            }
            for b in bookings
        ]

        return Response({
            **worker_data,
            "bookings_count": bookings.count(),
            "bookings": bookings_data,
            "ratings": {
                "average_rating": getattr(worker, "average_rating", 0),
                "total_ratings": getattr(worker, "total_ratings", 0),
            }
        })

    elif request.method == "PUT":
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


@api_view(['PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
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
    workers = Worker.objects.all()
    serializer = WorkerSerializer(workers, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def worker_details(request, pk):
    worker = get_object_or_404(Worker, pk=pk)
    serializer = WorkerSerializer(worker, context={'request': request})

    # Fetch reviews directly from WorkerRating
    reviews = WorkerRating.objects.filter(worker=worker).select_related("user").order_by("-created_at")
    reviews_list = [
        {
            "id": r.id,
            "user": r.user.username,
            "rating": r.rating,
            "review": r.review,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M")  # optional
        }
        for r in reviews
    ]

    return Response({
        **serializer.data,
        "ratings_list": reviews_list  # 👈 reviews attached here
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_booking(request, worker_id):
    """
    User creates a booking for a specific worker & one service
    """
    if request.user.role.lower() != "user":
        return Response({"detail": "Only users can book services"}, status=403)

    worker = get_object_or_404(Worker, pk=worker_id)
    service_id = request.data.get("service_id")   # ✅ single service_id
    date = request.data.get("date")
    time = request.data.get("time")

    if not service_id:
        return Response({"detail": "Service must be selected"}, status=400)

    data = {
        "service_id": service_id,
        "date": date,
        "time": time,
    }

    serializer = BookingSerializer(data=data)
    if serializer.is_valid():
        booking = serializer.save(
            user=request.user,
            worker=worker,
            status="pending"
        )
        return Response(BookingSerializer(booking).data, status=201)
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
    return Response(BookingSerializer(bookings, many=True).data)


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
        [booking.worker.user.email],
        fail_silently=True,
    )

    return Response(BookingSerializer(booking).data)
