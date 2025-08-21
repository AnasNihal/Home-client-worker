from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ServiceCategory,Worker,Booking,UserProfile

class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fileds = "__all__"

class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = "__all__"

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source = 'user.username', read_only = True)
    email = serializers.EmailField(source = 'user.email')
    first_name = serializers.CharField(source = 'user.first_name')
    last_name = serializers.CharField(source = 'user.last_name')

    class Meta:
        model = UserProfile
        fields = ['username','first_name','last_name','email','phone','bio','profileimage',
                  'address','city','postal_code','country']
    
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True)
    conform_password = serializers.CharField(write_only = True)

    class Meta:
        model = User
        fields = ['username','first_name','last_name','password','conform_password' ]
    
    def validate(self,data):
        if data['password'] != data['conform_password']:
            raise serializers.ValidationError("Password didnt match!!!")
        return data
    
    def create(self,validate_data):
        validate_data.pop('conform_password')
        user = User.objects.create_user(**validate_data)
        return user

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = "__all__"

 