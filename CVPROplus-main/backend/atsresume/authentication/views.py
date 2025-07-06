from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    UserRegisterSerializer, LoginSerializer, ForgotPasswordSerializer,
    ResetPasswordSerializer, ContactSerializer, VerifyTokenSerializer
)
from .models import user_collection, contact_collection, login_log_collection
from django.contrib.auth.hashers import make_password, check_password
import jwt
from rest_framework_simplejwt.tokens import RefreshToken
from types import SimpleNamespace 
import random, string
from django.core.mail import send_mail
from google.auth.transport import requests
from google.oauth2 import id_token
from bson import ObjectId
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
import logging
from email.mime.text import MIMEText
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

def generate_unique_username(first_name, last_name):
    base_username = f"{first_name.lower()}{last_name.lower()}"
    username = base_username

    for _ in range(10):
        random_suffix = ''.join(random.choices(string.digits, k=4))
        username = f"{base_username}{random_suffix}"

        if not user_collection.find_one({'username': username}):
            return username

    username = f"{base_username}{random.randint(10000, 99999)}"
    return username

    
class RegisterUserView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserRegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            first_name = serializer.validated_data['first_name']
            last_name = serializer.validated_data['last_name']
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            location = request.data.get('location', {})
            
            if user_collection.find_one({'email': email}):
                return Response(
                    {'email': 'A user with this email already exists.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            username = generate_unique_username(first_name, last_name)
            hashed_password = make_password(password)
            created_at = datetime.now(timezone.utc)

            user_data = {
                'first_name': first_name,
                'last_name': last_name,
                'username': username,
                'email': email,
                'password': hashed_password,
                'location': location,
                'created_at': created_at
            }
            user_collection.insert_one(user_data)
            
            return Response({"message": "User registered successfully.", "username": username}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            user_data = user_collection.find_one({'email': email})
            if not user_data:
                self.log_login_attempt(request, email, success=False)
                return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

            if not check_password(password, user_data['password']):
                self.log_login_attempt(request, email, success=False)
                return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

            user_obj = SimpleNamespace(id=str(user_data['_id']))
            refresh = RefreshToken.for_user(user_obj)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            user_data['_id'] = str(user_data['_id'])
            user_data.pop('password')

            self.log_login_attempt(request, email, success=True)

            return Response({
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": user_data
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def log_login_attempt(self, request, email, success):
        ip_address = request.META.get('REMOTE_ADDR', '')
        timestamp = datetime.now(timezone.utc)

        log_entry = {
            "email": email,
            "ip_address": ip_address,
            "success": success,
            "timestamp": timestamp,
            "user_agent": request.META.get('HTTP_USER_AGENT', ''),
        }

        login_log_collection.insert_one(log_entry)

logger = logging.getLogger(__name__)

class ForgotPasswordView(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = user_collection.find_one({'email': email})

            if not user:
                return Response({"error": "Invalid email. No user found."}, status=status.HTTP_404_NOT_FOUND)

            reset_token = str(random.randint(100000, 999999))
            expiry_time = datetime.now(timezone.utc) + timedelta(minutes=5)  # Token expires in 5 min

            # Save token and expiry time in MongoDB
            user_collection.update_one({'email': email}, {'$set': {'reset_token': reset_token, 'token_expiry': expiry_time}})

            # Send email with the token
            try:
                self.send_reset_email(email, reset_token)
                return Response({"message": "Password reset token sent to your email."}, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Failed to send reset email: {e}")
                return Response({"error": "Failed to send reset email."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_reset_email(self, email, token):
        subject = "Password Reset Request"
        message = f"Your password reset code is: {token}\nThis code is valid for 5 minutes."
        from_email = settings.EMAIL_HOST_USER
        recipient_list = [email]

        try:
            # Attempt to send the email using Django's send_mail function (preferred)
            send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            logger.info(f"Password reset email sent successfully to {email}")
        except Exception as e:
            logger.error(f"Failed to send email using Django's send_mail. Error: {e}")
            raise e  # Raise the exception so the calling function can handle it properly
            

class VerifyTokenView(APIView):
    def post(self, request):
        serializer = VerifyTokenSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            token = serializer.validated_data['token']

            user = user_collection.find_one({'email': email})
            if not user:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            stored_token = user.get('reset_token')
            token_expiry = user.get('token_expiry')
            if token_expiry.tzinfo is None:
                token_expiry = token_expiry.replace(tzinfo=timezone.utc)

            if not stored_token or not token_expiry:
                return Response({"error": "No token found. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

            if token != stored_token:
                return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

            if datetime.now(timezone.utc) > token_expiry:
                user_collection.update_one(
                    {'email': email}, 
                    {'$unset': {'reset_token': "", 'token_expiry': ""}}
                )
                return Response({"error": "Token has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

            return Response({"message": "Token verified successfully. You can now reset your password."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ResetPasswordView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']

            user = user_collection.find_one({'email': email})
            if not user:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            stored_token = user.get('reset_token')
            token_expiry = user.get('token_expiry')
            if token_expiry.tzinfo is None:
                token_expiry = token_expiry.replace(tzinfo=timezone.utc)

            if not stored_token or not token_expiry:
                return Response({"error": "No valid reset token found. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

            if token != stored_token:
                return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

            if datetime.now(timezone.utc) > token_expiry:
                return Response({"error": "Token has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

            hashed_password = make_password(new_password)

            user_collection.update_one(
                {'email': email}, 
                {'$set': {'password': hashed_password},
                '$unset': {'reset_token': "", 'token_expiry': ""}}
            )

            return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContactUsView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = ContactSerializer(data=request.data)
        
        if serializer.is_valid():
            contact_data = serializer.validated_data
            contact_collection.insert_one(contact_data)

            # Send email notification
            try:
                self.send_contact_email(contact_data)
                return Response({"message": "Your message has been sent successfully!"}, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Failed to send contact email: {e}")
                return Response({"error": "Your message was saved but email notification failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def send_contact_email(self, contact_data):
        subject = f"""New Contact Us Message : {contact_data.get('subject')}"""
        message = f"""
        Name: {contact_data.get('name', 'N/A')}
        Email: {contact_data.get('email', 'N/A')}
        Subject: {contact_data.get('subject', 'No Subject provided')}
        Message: {contact_data.get('message', 'No message provided')}

        This message was sent from your website's Contact Us form.
        """
        from_email = settings.EMAIL_HOST_USER
        recipient_list = ["group6asdc@gmail.com"]

        # Send email
        send_mail(subject, message, from_email, recipient_list, fail_silently=False)
        logger.info(f"Contact email sent successfully to {recipient_list}")
    
class GoogleLoginView(APIView):
    def post(self, request):
        try:
            token = request.data.get("token")
            if not token:
                logger.warning("Google login attempt with missing token")
                return Response(
                    {"error": "Token is missing"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            google_data = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                settings.GOOGLE_CLIENT_ID,
                clock_skew_in_seconds=5
            )

            email = google_data.get("email")
            if not email:
                logger.warning("Google login didn't provide email")
                return Response(
                    {"error": "Email not provided by Google"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = self._get_or_create_user(google_data, request.data.get("location"))
            access_token = self._generate_access_token(user)
            self._log_login(request, email, True)

            logger.info(f"Successful Google login for {email}")
            return Response({
                "token": access_token,
                "user": user
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            logger.error(f"Invalid Google token: {str(e)}")
            return Response(
                {"error": "Invalid Google token"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Google login error: {str(e)}", exc_info=True)
            return Response(
                {"error": "Login failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _get_or_create_user(self, google_data, location):
        email = google_data["email"]
        user = user_collection.find_one({"email": email})
        
        if not user:
            user_data = {
                "email": email,
                "first_name": google_data.get("given_name", ""),
                "last_name": google_data.get("family_name", ""),
                "username": self._generate_username(google_data),
                "password": make_password(None),
                "location": location or "Unknown",
                "created_at": datetime.now(timezone.utc),
            }
            result = user_collection.insert_one(user_data)
            user_data["_id"] = str(result.inserted_id)
            return user_data
            
        user["_id"] = str(user["_id"])
        return user

    def _generate_username(self, google_data):
        first = google_data.get("given_name", "").lower()
        last = google_data.get("family_name", "").lower()
        return f"{first}{last}"

    def _generate_access_token(self, user):
        payload = {
            "email": user["email"],
            "exp": datetime.now(timezone.utc) + timedelta(days=1),
            "iat": datetime.now(timezone.utc),
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    def _log_login(self, request, email, success):
        login_log_collection.insert_one({
            "email": email,
            "ip_address": request.META.get('REMOTE_ADDR', ''),
            "success": success,
            "timestamp": datetime.now(timezone.utc),
            "user_agent": request.META.get('HTTP_USER_AGENT', ''),
        })