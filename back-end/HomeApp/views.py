from django.shortcuts import render,get_object_or_404
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response 
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers  import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    WorkerRegistrationSerializer,
    WorkerServiceSerializer,
    WorkerSerializer,
    LoginSerializer,
    WorkerRatingSummarySerializer,
    )
from rest_framework import status
from django.contrib.auth import authenticate
from .models import UserProfile, Worker, WorkerService,WorkerRating 



@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username= username , password = password)

    if not user:
        return Response({"details":"Invalid Credintials"},
        status=status.HTTP_401_UNAUTHORIZED)
    
    refresh = RefreshToken.for_user(user)
    payload = {
        'refresh':str(refresh),
        'access':str(refresh.access_token),
        'role':user.role,   
        'username':user.username 
    }
    out = LoginSerializer(payload).data
    return Response(out,status=status.HTTP_200_OK)
    


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
def user_profile(request):
    if request.user.is_anonymous:
      return Response({"detail": "Authentication required"}, status=401)

    profile , create = UserProfile.objects.get_or_create(user = request.user)
    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile,data=request.data,partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
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


@api_view(['GET','PUT'])
@permission_classes([IsAuthenticated])
def worker_dashboard(request):
        if request.user.role != "worker":
            return Response({"details":"Only the worker can access this page"},status=status.HTTP_403_FORBIDDEN)
        
        worker = get_object_or_404(Worker, data=request.data)

        if request.method == 'GET':
            return Response(WorkerSerializer(worker).data)
        
        elif request.method == "PUT":
            serializer = WorkerSerializer(worker, data=request.data , partial = True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_service(request):

        if request.user.role != "Worker":
            return Response({"details":"Only the worker can access this page"},status=status.HTTP_403_FORBIDDEN)
        
        worker = get_object_or_404(worker, data=request.data)
        serializer = WorkerServiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(worker=worker)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT','PATCH'])
@permission_classes([IsAuthenticated])
def edit_service(request,service_id):

    if request.user.role != "worker":
        return Response({'details':'Only worker can access this page'},status=status.HTTP_403_FORBIDDEN)
    
    worker = get_object_or_404(Worker, user = request.user)
    services = get_object_or_404(WorkerService ,id = service_id ,worker=worker)

    partial = ( request.method == 'PATCH')
    serializer = WorkerServiceSerializer(services,data=request.data,partial = partial)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

        
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_service(request,service_id):

    if request.user.role != "worker":
        return Response({'details':'Only worker can access this page'},status=status.HTTP_403_FORBIDDEN)

    worker = get_object_or_404(Worker, user = request.user)
    services = get_object_or_404(WorkerService ,id = service_id,worker=worker)
    services.delete()
    return Response(status=status.HTTP_203_NON_AUTHORITATIVE_INFORMATION)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Avg

from .models import Worker, WorkerRating
from .serializers import WorkerSerializer


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
    
