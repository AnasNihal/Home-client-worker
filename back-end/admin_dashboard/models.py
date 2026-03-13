from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class AdminActionLog(models.Model):
    """Log all admin actions for audit trail"""
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_actions')
    action = models.CharField(max_length=100)  # e.g., 'user_created', 'booking_cancelled'
    resource_type = models.CharField(max_length=50)  # e.g., 'user', 'worker', 'booking'
    resource_id = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Admin Action Log'
        verbose_name_plural = 'Admin Action Logs'
    
    def __str__(self):
        return f"{self.admin.username} - {self.action} on {self.resource_type} {self.resource_id or ''}"
