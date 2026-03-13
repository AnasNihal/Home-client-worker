from django.urls import path
from . import views

app_name = 'admin_dashboard'

urlpatterns = [
    # Authentication
    path('login/', views.admin_login, name='admin_login'),
    path('logout/', views.admin_logout, name='admin_logout'),
    path('me/', views.admin_me, name='admin_me'),
    
    # Dashboard Stats
    path('stats/', views.admin_stats, name='admin_stats'),
    
    # User Management
    path('users/', views.admin_users, name='admin_users'),
    path('users/<int:user_id>/', views.admin_user_detail, name='admin_user_detail'),
    path('users/<int:user_id>/toggle-status/', views.admin_toggle_user_status, name='admin_toggle_user_status'),
    path('users/<int:user_id>/', views.admin_delete_user, name='admin_delete_user'),
    
    # Worker Management
    path('workers/', views.admin_workers, name='admin_workers'),
    path('workers/<int:worker_id>/', views.admin_worker_detail, name='admin_worker_detail'),
    path('workers/<int:worker_id>/toggle-availability/', views.admin_toggle_worker_availability, name='admin_toggle_worker_availability'),
    path('workers/<int:worker_id>/verify/', views.admin_verify_worker, name='admin_verify_worker'),
    path('workers/<int:worker_id>/', views.admin_delete_worker, name='admin_delete_worker'),
    
    # Booking Management
    path('bookings/', views.admin_bookings, name='admin_bookings'),
    path('bookings/<int:booking_id>/', views.admin_booking_detail, name='admin_booking_detail'),
    path('bookings/create/', views.admin_create_booking, name='admin_create_booking'),
    path('bookings/<int:booking_id>/cancel/', views.admin_cancel_booking, name='admin_cancel_booking'),
    path('bookings/<int:booking_id>/update-status/', views.admin_update_booking_status, name='admin_update_booking_status'),
    path('bookings/<int:booking_id>/', views.admin_delete_booking, name='admin_delete_booking'),
    
    # Service Management
    path('services/', views.admin_services, name='admin_services'),
    path('services/<int:service_id>/toggle/', views.admin_toggle_service, name='admin_toggle_service'),
    path('services/<int:service_id>/', views.admin_delete_service, name='admin_delete_service'),
]
