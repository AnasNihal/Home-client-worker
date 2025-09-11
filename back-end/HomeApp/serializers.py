from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profession, WorkerService,Worker,UserProfile,WorkerRating,Booking
from django.db.models import Avg


User = get_user_model()

class LoginSerializer(serializers.Serializer):
        refresh = serializers.CharField()
        access = serializers.CharField()
        role = serializers.CharField()
        username = serializers.Serializer()

# User Serializer 


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", required=False, allow_blank=True)
    first_name = serializers.CharField(source="user.first_name", required=False, allow_blank=True)
    last_name = serializers.CharField(source="user.last_name", required=False, allow_blank=True)
    profileimage = serializers.ImageField(required=False, allow_null=True)
    profileimage_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "phone",
            "bio",
            "profileimage",
            "profileimage_url",
            "address",
            "city",
            "postal_code",
            "country",
        ]

    def get_profileimage_url(self, obj):
        request = self.context.get("request")
        if obj.profileimage:
            return request.build_absolute_uri(obj.profileimage.url)
        return None

    def update(self, instance, validated_data):
        # handle nested user fields
        user_data = validated_data.pop("user", {})
        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # let DRF handle saving profileimage + other fields
        return super().update(instance, validated_data)



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
        email = validated_data.pop('email',"")
        user = User.objects.create_user(username=username , email = email , password=password,role = 'user')
        UserProfile.objects.create(user = user,phone = validated_data.get('phone',''),address = validated_data.get('address' , ''))

        return user

# Worker serializer

class WorkerRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    # initial worker profile fields:
    phone = serializers.CharField()
    profession_id = serializers.PrimaryKeyRelatedField(
        queryset=Profession.objects.all(),  # ✅ dropdown options from DB
        write_only=True,
        source="profession"                 # ✅ will be saved into Worker.profession
    )
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
        worker = Worker.objects.create(user=user,name=username, email=email, **validated_data)
        return worker

class WorkerServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerService
        fields = ['id', 'services', 'description', 'price']
        

class WorkerRatingSummarySerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()
    total_ratings = serializers.SerializerMethodField()

    class Meta:
        model = Worker  # attach rating info to Worker
        fields = ['average_rating', 'total_ratings']

    def get_average_rating(self, obj):
        avg = WorkerRating.objects.filter(worker=obj).aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0

    def get_total_ratings(self, obj):
        return WorkerRating.objects.filter(worker=obj).count()

class WorkerRatingSerializer(serializers.ModelSerializer):
    user__username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = WorkerRating
        fields = ["id", "rating", "review", "user__username"]


class ProfessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profession
        fields = ["id", "name", "slug"]

class WorkerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    services = WorkerServiceSerializer(many=True, read_only=True)
    ratings = WorkerRatingSummarySerializer(source='*', read_only=True)# 🔹 include nested rating summary
    reviews = WorkerRatingSerializer(source="ratings", many=True, read_only=True)


    # 🔹 Nested profession serializer (read-only)
    profession = ProfessionSerializer(read_only=True)

    # 🔹 For updates (write-only)
    profession_id = serializers.PrimaryKeyRelatedField(
        queryset=Profession.objects.all(),
        write_only=True,
        source="profession"
    )

    class Meta:
        model = Worker
        fields = [
            'id', 'image', 'username', 'email', 'name', 'phone',
            'profession', 'profession_id', 'experience', 'location', 'bio',
            'services', 'ratings' , 'reviews' # 🔹 include ratings here
        ]
        extra_kwargs = {
            "name": {"required": False},
            "phone": {"required": False},
            "profession": {"required": False},
            "experience": {"required": False},
            "location": {"required": False},
            "bio": {"required": False},
            "email": {"required": False},
        }



# Nested serializer for Worker user info
class WorkerUserSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Worker
        fields = ["id", "name", "user"]

    def get_user(self, obj):
        return {
            "username": obj.user.username,
            "email": obj.user.email
        }


# Serializer for Booking
class BookingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)  # user who booked
    worker = WorkerUserSerializer(read_only=True)          # nested worker info
    service = WorkerServiceSerializer(read_only=True)      # nested service info
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=WorkerService.objects.all(),
        source="service",
        write_only=True
    )

    class Meta:
        model = Booking
        fields = [
            "id", "user", "worker", "service", "service_id",
            "date", "time", "status", "notes", "created_at"
        ]
        read_only_fields = ["id", "status", "created_at", "user", "worker", "service"]




    



# Booking serializer

# class BookingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Booking
#         fields = "__all__"

 