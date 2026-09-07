from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
import jwt
from django.conf import settings
from datetime import datetime

User = get_user_model()


class JWTAuthentication(authentication.BaseAuthentication):
    """
    Custom JWT authentication that validates tokens signed with the SECRET_KEY.
    """
    
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        
        try:
            # Decode the JWT token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            # Check if token is expired
            if datetime.utcnow() > datetime.utcfromtimestamp(payload['exp']):
                raise AuthenticationFailed('Token has expired')
            
            # Get the user from the payload
            user_id = payload.get('user_id')
            if not user_id:
                raise AuthenticationFailed('Invalid token payload')
            
            try:
                user = User.objects.get(id=user_id)
                return (user, token)
            except User.DoesNotExist:
                raise AuthenticationFailed('User not found')
                
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')