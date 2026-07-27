from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SignupView, LoginView, GoogleLoginView, SessionViewSet, UserViewSet

router = DefaultRouter()
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('', include(router.urls)),
]
