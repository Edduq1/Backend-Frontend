from django.urls import path
from rest_framework_simplejwt.views import TokenBlacklistView
from .views import (
    MultiStageLoginView,
    UserDataView,
    UserRegistrationView,
    FacialRegistrationView
)

urlpatterns = [
    # --- Autenticación (Login) ---
    # POST /api/v1/auth/login
    path('auth/login', MultiStageLoginView.as_view(), name='api_login'),
    
    # GET /api/v1/auth/me
    path('auth/me', UserDataView.as_view(), name='api_me'),
    
    # POST /api/v1/auth/logout
    path('auth/logout', TokenBlacklistView.as_view(), name='api_logout'),

    # --- Registro de Usuarios ---
    # POST /api/v1/users
    path('users', UserRegistrationView.as_view(), name='api_register_user'),
    
    # POST /api/v1/users/<user_id>/facial-register
    path('users/<str:user_id>/facial-register', FacialRegistrationView.as_view(), name='api_facial_register'),
]