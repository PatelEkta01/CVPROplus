# urls.py
from django.urls import path
from .views import AdminLoginLogsView,AdminLoginView,AdminRegisterView,AdminUserListView,AdminAllResumesView,AdminDeleteUserView
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path('login/',AdminLoginView.as_view(), name='login_user'),
    path('register/',AdminRegisterView.as_view(), name='login_user'),
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('resumes/', AdminAllResumesView.as_view(), name='admin-resumes'),
    path('login-logs/', AdminLoginLogsView.as_view(), name='admin-login-logs'),
    path('deleteusers/<str:user_id>/', AdminDeleteUserView.as_view(), name='admin-delete-user'),
]