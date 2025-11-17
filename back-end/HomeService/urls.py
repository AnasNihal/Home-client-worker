from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("HomeApp.urls")),

    # Serve static and media FIRST
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) \
  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# SPA routing LAST
urlpatterns += [
    path("", TemplateView.as_view(template_name="index.html")),
    re_path(r"^(?!static/|media/).*", TemplateView.as_view(template_name="index.html")),
]
