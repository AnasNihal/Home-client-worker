from datetime import datetime
from decimal import Decimal
import logging

import stripe
from django.conf import settings
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Avg
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes, throttle_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import AnonRateThrottle
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


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
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
        'role': user.role.lower(),   # 👈 always lower-case ("user"/"worker")  # pyright: ignore
        'username': user.username
    }
    return Response(payload, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AnonRateThrottle])
def user_register(request):
    serializer = UserRegistrationSerializer(data = request.data)
    if serializer.is_valid():
        user  = serializer.save()
        
        # Generate tokens for the new user
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'User Registered',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'role': user.role,
            'is_superuser': user.is_superuser
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET','PUT'])  # pyright: ignore
@permission_classes([IsAuthenticated])  # pyright: ignore
@parser_classes([MultiPartParser, FormParser, JSONParser])   # pyright: ignore
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
@throttle_classes([AnonRateThrottle])
def worker_register(request):
    serializer = WorkerRegistrationSerializer( data = request.data)
    if serializer.is_valid():
       serializer.save()
       return Response({'message':"Worker Registered"},status=status.HTTP_200_OK)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
