from . import views
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [

    # user urls
    path('auth/login',views.login,name = 'login'),
    path('auth/user/register',views.user_register,name = 'user_register'),   
    path('user/profile',views.user_profile,name='user_profile'),

    # Worker urls
    path('auth/worker/register',views.worker_register,name='worker_register'),
    path('worker/dashboard',views.worker_dashboard,name='worker_dashboard'),
    path('worker/service',views.add_service,name='add_service'),
    path('worker/service/<int:service_id>',views.edit_service,name='edit_service'),
    path('worker/service/<int:service_id>',views.delete_service,name='delete_service'),

    # Woker public view
    path('worker/worker_list',views.worker_list,name='worker_list'),
    path('worker/worker_details/<int:pk>',views.worker_details,name='worker_details'),
    path("workers/<int:worker_id>/rate/", views.rate_worker, name="rate-worker"),


]
