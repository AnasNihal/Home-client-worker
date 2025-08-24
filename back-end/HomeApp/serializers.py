from rest_framework import serializers
from django.contrib.auth.models import User
from .models import WorkerService,Worker,UserProfile


class LoginSerializer(serializers.Serializer):
        refresh = serializers.CharField()
        access = serializers.CharField()
        role = serializers.CharField()
        username = serializers.Serializer()

# User Serializer 
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source = 'user.username', read_only = True)
    email = serializers.EmailField(source = 'user.email')
    first_name = serializers.CharField(source = 'user.first_name')
    last_name = serializers.CharField(source = 'user.last_name')

    class Meta:
        model = UserProfile
        fields = ['username','first_name','last_name','email','phone','bio','profileimage',
                  'address','city','postal_code','country']
    
class UserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only = True)
    email = serializers.EmailField(required = False,allow_blank = True)
    phone  = serializers.CharField(required = False,allow_blank = True)
    address = serializers.CharField(required = False,allow_blank = True)
    
    def validate_username (self, value):
        if User.objects.filter(username = value).exists():
            raise serializers.ValidationError("Username already taken")
        return value 

    def create(self,validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email = validated_data.pop(email,"")
        user = User.objects.create_user(username=username , email = email , password=password,role = 'user')
        UserProfile.objects.create(user = user,phone  = validated_data.get('phone',''),address = validated_data.get('address' , ''))

        return user


# Worker serializer

class WorkerRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    # initial worker profile fields:
    name = serializers.CharField()
    phone = serializers.CharField()
    profession = serializers.CharField(required=False, allow_blank=True)
    experience = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)

    def validate_username (self,value):
        if User.objects.filter(username = value).exists():
            raise serializers.ValidationError("Username is already Taken")
        return value
    
    def create(self , validated_data):
        username = validated_data.pop("username")
        password = validated_data.pop("password")
        email = validated_data.pop("email", "")
        user = User.objects.create_user(username=username, email=email, password=password, role="worker")
        # create Worker profile tied to that account
        worker = Worker.objects.create(user=user, email=email, **validated_data)
        return worker

class WorkerServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerService
        fileds = ['id','service','description','price']

class WorkerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    service = WorkerServiceSerializer(many=True,read_only = True)

    class Meta:
        model = Worker
        fields = ['id','image','username','email','name','phone','profession',
                  'experience','location',"completed_jobs",'bio', "rating", "comments",'service']
        extra_kwargs = {  # allow partial updates
            "name": {"required": False},
            "phone": {"required": False},
            "profession": {"required": False},
            "experience": {"required": False},
            "location": {"required": False},
            "bio": {"required": False},
            "email": {"required": False},
            "rating": {"required": False},
            "comments": {"required": False},
             "completed_jobs": {"required": False},
        }



# Booking serializer

# class BookingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Booking
#         fields = "__all__"

 