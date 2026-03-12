import logging
from django.http import JsonResponse
from django.conf import settings
import time

logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware:
    """Add security headers to all responses"""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # In production, add additional headers
        if not settings.DEBUG:
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        return response


class RequestLoggingMiddleware:
    """Log requests for security monitoring"""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        # Log request details
        logger.info(f"Request: {request.method} {request.path} from {request.META.get('REMOTE_ADDR')}")
        
        response = self.get_response(request)
        
        # Log response details
        duration = time.time() - start_time
        logger.info(f"Response: {response.status_code} in {duration:.2f}s")
        
        # Log suspicious activity
        if response.status_code == 401:
            logger.warning(f"Unauthorized access attempt: {request.method} {request.path}")
        elif response.status_code == 403:
            logger.warning(f"Forbidden access attempt: {request.method} {request.path}")
        elif response.status_code == 429:
            logger.warning(f"Rate limit exceeded: {request.method} {request.path}")
        
        return response
