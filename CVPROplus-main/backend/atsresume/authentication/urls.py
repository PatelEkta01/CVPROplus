# urls.py
from django.urls import path
from .views import (
    RegisterUserView, LoginView, ForgotPasswordView,
    VerifyTokenView, ResetPasswordView, ContactUsView,
    GoogleLoginView
)
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register_user'),
    path('login/', LoginView.as_view(), name='login_user'),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-otp/', VerifyTokenView.as_view(), name='verify-token'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('contact-us/', ContactUsView.as_view(), name='contact-us'),
    path('google-login/', GoogleLoginView.as_view(), name="google-login"),
]