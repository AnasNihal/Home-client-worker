from . import views
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [

    # user Login/register
    path('api/user/register',views.user_register,name = 'user_register'),   
    path('api/user/login',views.user_login,name = 'user_login'),
    path('user/profile',views.user_profile,name='user_profile')
]
