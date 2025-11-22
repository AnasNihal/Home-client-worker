"""
Django settings for HomeService project.
"""

import os
from pathlib import Path
from datetime import timedelta
from decouple import config
import dj_database_url


BASE_DIR = Path(__file__).resolve().parent.parent

# -------------------------------------------------------------------
# SECURITY
# -------------------------------------------------------------------
SECRET_KEY = config('SECRET_KEY', default="django-insecure-ud%zbuh!g)7b@46erswlkg!lrv$oo&kw(s07l9&@^2@j2(4**1")

DEBUG = config('DEBUG', default=True, cast=bool)

# Allow Render & local
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,.onrender.com').split(',')

# -------------------------------------------------------------------
# INSTALLED APPS
# -------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "HomeApp",
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt",  # Add this if not already there
]

# -------------------------------------------------------------------
# MIDDLEWARE  (order matters!)
# -------------------------------------------------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # REQUIRED - Right after SecurityMiddleware

    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # Before CommonMiddleware
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# -------------------------------------------------------------------
# CORS SETTINGS
# -------------------------------------------------------------------
# For local development with React dev server
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
# ]
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_USE_SESSIONS = False

# Update CSRF_TRUSTED_ORIGINS to include your production domain
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://your-render-domain.onrender.com",  # Add your actual domain
]

CORS_ALLOW_CREDENTIALS = True

# In production (single domain), CORS is not needed but keeping for dev
# If you want to allow all origins in dev:
# CORS_ALLOW_ALL_ORIGINS = DEBUG  # Only in debug mode

ROOT_URLCONF = "HomeService.urls"

# -------------------------------------------------------------------
# TEMPLATES
# -------------------------------------------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / 'templates'],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "HomeService.wsgi.application"

# -------------------------------------------------------------------
# DATABASE
# -------------------------------------------------------------------
CONN_MAX_AGE = 600 
DATABASES = {
    'default': dj_database_url.config(
        default=config(
            'DATABASE_URL',
            default='postgresql://postgres:postgres@localhost:5432/postgres'
        ),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# -------------------------------------------------------------------
# PASSWORD VALIDATION
# -------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# -------------------------------------------------------------------
# INTERNATIONALIZATION
# -------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# -------------------------------------------------------------------
# STATIC FILES (CSS, JavaScript, Images)
# -------------------------------------------------------------------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'  # Where collectstatic puts files

# React build/static files go here BEFORE collectstatic
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Use WhiteNoise for serving static files efficiently
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# -------------------------------------------------------------------
# MEDIA FILES (User Uploads)
# -------------------------------------------------------------------
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# -------------------------------------------------------------------
# REST FRAMEWORK & JWT
# -------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# -------------------------------------------------------------------
# CUSTOM USER MODEL
# -------------------------------------------------------------------
AUTH_USER_MODEL = "HomeApp.CustomerUser"

# -------------------------------------------------------------------
# DEFAULT PRIMARY KEY FIELD TYPE
# -------------------------------------------------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

