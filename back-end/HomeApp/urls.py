from . import views
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from django.views.generic import TemplateView
from .views import login



urlpatterns = [

    path("login/", login, name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # user urls
    path('auth/login',views.login,name = 'login'),
    path('auth/user/register',views.user_register,name = 'user_register'),   
    path('user/profile/',views.user_profile,name='user_profile'),

    # Worker urls
    path('auth/worker/register',views.worker_register,name='worker_register'),
    path('worker/dashboard',views.worker_dashboard,name='worker_dashboard'),
    path('worker/service',views.add_service,name='add_service'),
    path('worker/service/<int:service_id>',views.edit_service,name='edit_service'),
    # path('worker/service/<int:service_id>',views.delete_service,name='delete_service'),

    # Woker public view
    path('worker/worker_list',views.worker_list,name='worker_list'),
    path('worker/worker_details/<int:pk>',views.worker_details,name='worker_details'),
    path("workers/<int:worker_id>/rate/", views.rate_worker, name="rate-worker"),
    path("worker/profession_list", views.profession_list, name="profession-list"),

    # Booking urls

    path("workers/<int:worker_id>/book/", views.create_booking, name="create_booking"),
    path("user/bookings/", views.user_bookings, name="user_bookings"),
    path("worker/bookings/", views.worker_bookings, name="worker_bookings"),
    path("bookings/<int:booking_id>/update-status/", views.update_booking_status, name="update_booking_status"),
    # User booking cancel
    path("bookings/<int:booking_id>/cancel/", views.cancel_booking, name="cancel_booking"),
    path("bookings/<int:booking_id>/complete/", views.user_complete_booking, name="user-complete-booking"),

    path('', TemplateView.as_view(template_name="index.html"), name="home"),

]
