from . import views
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView



urlpatterns = [
    # Authentication URLs
    path("auth/login/", views.login, name="login"),
    path("auth/user/register/", views.user_register, name="user_register"),   
    path("auth/worker/register/", views.worker_register, name="worker_register"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # User URLs
    path('user/profile/', views.user_profile, name='user_profile'),

    # Worker URLs
    path('worker/dashboard/', views.worker_dashboard, name='worker_dashboard'),
    path('worker/service/', views.add_service, name='add_service'),
    path('worker/service/<int:service_id>/', views.edit_service, name='edit_service'),

    # Worker public view
    path('workers/', views.worker_list, name='worker_list'),
    path('workers/<int:pk>/', views.worker_details, name='worker_details'),
    path("workers/<int:worker_id>/rate/", views.rate_worker, name="rate-worker"),
    path("professions/", views.profession_list, name="profession-list"),

    # Booking URLs
    path("workers/<int:worker_id>/book/", views.create_booking, name="create_booking"),
    path("payments/stripe/checkout/<int:booking_id>/", views.create_stripe_checkout_session, name="create_stripe_checkout_session"),
    path("payments/stripe/checkout/new/<int:worker_id>/", views.create_stripe_checkout_session_new, name="create_stripe_checkout_session_new"),
    path("payments/stripe/confirm/", views.confirm_stripe_payment, name="confirm_stripe_payment"),
    path("user/bookings/", views.user_bookings, name="user_bookings"),
    path("worker/bookings/", views.worker_bookings, name="worker_bookings"),
    path("bookings/<int:booking_id>/update-status/", views.update_booking_status, name="update_booking_status"),
    path("bookings/<int:booking_id>/cancel/", views.cancel_booking, name="cancel_booking"),
    path("bookings/<int:booking_id>/complete/", views.user_complete_booking, name="user-complete-booking"),
    path("payments/stripe/webhook/", views.stripe_webhook, name="stripe_webhook"),
]
