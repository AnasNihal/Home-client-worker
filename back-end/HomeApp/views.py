from django.shortcuts import render
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
    )
from rest_framework import status
from django.contrib.auth import authenticate
from .models import UserProfile



@api_view(['POST'])
@permission_classes([AllowAny])
def user_login(request):
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
def user_register(request):
    serializer = UserRegistrationSerializer(data = request.data)
    if serializer.is_valid():
        user  = serializer.save()
        refresh =  RefreshToken.for_user(user)
        return Response({
            'user' : UserRegistrationSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh':str(refresh)              
        },status.HTTP_201_CREATED)
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

