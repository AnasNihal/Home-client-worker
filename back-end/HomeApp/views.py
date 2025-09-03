from django.shortcuts import render,get_object_or_404
from rest_framework.decorators import api_view,permission_classes,parser_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response 
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Avg
from .serializers  import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    WorkerRegistrationSerializer,
    WorkerServiceSerializer,
    WorkerSerializer,
    LoginSerializer,
    )
from rest_framework import status
from django.contrib.auth import authenticate
from .models import UserProfile, Worker, WorkerService,WorkerRating 



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

    profile , create = UserProfile.objects.get_or_create(user = request.user)
    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile,data=request.data,partial = True,context={'request': request}, )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors,status=400)
    
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
        return Response(WorkerSerializer(worker).data)

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


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def edit_service(request, service_id):
    if request.user.role.lower() != "worker":
        return Response({'detail': 'Only workers can edit services'}, status=403)

    worker = get_object_or_404(Worker, user=request.user)
    service = get_object_or_404(WorkerService, id=service_id, worker=worker)

    serializer = WorkerServiceSerializer(service, data=request.data, partial=(request.method == 'PATCH'))
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

        
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_service(request, service_id):
    if request.user.role.lower() != "worker":
        return Response({'detail': 'Only workers can delete services'}, status=403)

    worker = get_object_or_404(Worker, user=request.user)
    service = get_object_or_404(WorkerService, id=service_id, worker=worker)

    service.delete()
    return Response(status=204)

# ✅ List all workers with ratings included
@api_view(['GET'])
def worker_list(request):
    workers = Worker.objects.all()
    serializer = WorkerSerializer(workers, many=True, context={'request': request})
    return Response(serializer.data)


# ✅ Single worker details (with ratings + services)
@api_view(['GET'])
def worker_details(request, pk):
    worker = get_object_or_404(Worker, pk=pk)
    serializer = WorkerSerializer(worker, context={'request': request})
    return Response(serializer.data)


# ✅ Rate a worker (create/update rating)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def rate_worker(request, worker_id):
    # Find worker
    worker = get_object_or_404(Worker, pk=worker_id)

    # Validate rating value
    rating_value = request.data.get("rating")
    if not rating_value:
        return Response({"error": "Rating is required"}, status=400)

    try:
        rating_value = int(rating_value)
    except ValueError:
        return Response({"error": "Rating must be a number"}, status=400)

    if rating_value < 1 or rating_value > 5:
        return Response({"error": "Rating must be between 1 and 5"}, status=400)

    # Create or update rating
    WorkerRating.objects.update_or_create(
        worker=worker,
        user=request.user,
        defaults={"rating": rating_value}
    )

    # Return updated rating summary
    avg = WorkerRating.objects.filter(worker=worker).aggregate(Avg('rating'))['rating__avg']
    total = WorkerRating.objects.filter(worker=worker).count()

    return Response({
        "message": "Rating submitted successfully",
        "average_rating": round(avg, 1) if avg else 0,
        "total_ratings": total
    }, status=status.HTTP_201_CREATED)
    
