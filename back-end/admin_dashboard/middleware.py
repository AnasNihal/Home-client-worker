from django.http import JsonResponse
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

class AdminMiddleware:
    """
    Middleware to protect admin routes and ensure only superusers can access them
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if the request is for an admin route
        if request.path.startswith('/api/admin/') or request.path.startswith('/api/superadmin/'):
            # For admin login endpoint, skip authentication
            if request.path == '/api/superadmin/login/':
                return self.get_response(request)
            
            # For all other admin routes, check authentication and superuser status
            try:
                # Try to authenticate with JWT
                jwt_auth = JWTAuthentication()
                auth_header = request.headers.get('Authorization')
                
                if not auth_header or not auth_header.startswith('Bearer '):
                    return JsonResponse(
                        {"error": "Authentication required"}, 
                        status=401
                    )
                
                # Remove 'Bearer ' prefix
                token = auth_header.split(' ')[1]
                validated_token = jwt_auth.get_validated_token(token)
                user = jwt_auth.get_user(validated_token)
                
                if not user.is_superuser:
                    return JsonResponse(
                        {"error": "Superuser access required"}, 
                        status=403
                    )
                
                # Attach user to request for downstream use
                request.user = user
                
            except (InvalidToken, Exception):
                return JsonResponse(
                    {"error": "Invalid or expired token"}, 
                    status=401
                )
        
        response = self.get_response(request)
        return response
