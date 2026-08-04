from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SignupView, LoginView,
    GoogleLoginView, GoogleOAuthCallbackView,
    SessionViewSet, UserViewSet, ReviewViewSet,
)

router = DefaultRouter()
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'users', UserViewSet, basename='user')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/login/', LoginView.as_view(), name='login'),
    # Step 2 (optional fallback): Direct token verification for GSI token flow
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    # Step 3: allauth's callback triggers LOGIN_REDIRECT_URL → this view
    path('auth/google/callback/', GoogleOAuthCallbackView.as_view(), name='google_oauth_callback'),
    path('', include(router.urls)),
]
