# serializers.py
from rest_framework import serializers
import re
from .models import user_collection
class UserRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150, required=True)
    last_name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        """Centralized validation for all fields"""
        errors = {}
        
        # First name validation
        if not re.match(r'^[a-zA-Z\s]+$', data['first_name']):
            errors['first_name'] = "First name should only contain letters and spaces."
        
        # Last name validation
        if not re.match(r'^[a-zA-Z\s]+$', data['last_name']):
            errors['last_name'] = "Last name should only contain letters and spaces."
        
        # Email validation
        if user_collection.find_one({'email': data['email']}):
            errors['email'] = "Email is already registered."
        
        # Password validation
        password = data['password']
        if len(password) < 8:
            errors['password'] = "Password must be at least 8 characters long."
        elif not re.search(r'[A-Z]', password):
            errors['password'] = "Password must contain at least one uppercase letter."
        elif not re.search(r'\d', password):
            errors['password'] = "Password must contain at least one digit."
        elif not re.search(r'[@$!%*?&]', password):
            errors['password'] = "Password must contain at least one special character (@$!%*?&)."
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class VerifyTokenSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    token = serializers.CharField(min_length=6, max_length=6, required=True)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    token = serializers.CharField(min_length=6, max_length=6, required=True)
    new_password = serializers.CharField(min_length=6, required=True)
    
    def validate_new_password(self, value):
        """
        Validate password strength:
        - At least 8 characters
        - Contains at least one number
        - Contains at least one uppercase letter
        """
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        
        if not re.search(r'[@$!%*?&]', value):
            raise serializers.ValidationError("Password must contain at least one special character (@$!%*?&).")
        
        return value
class ContactSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    subject = serializers.CharField(max_length=255, required=True)
    message = serializers.CharField(required=True)

    def validate(self, data):
        """Centralized validation for all fields"""
        errors = {}
        
        # Name validation
        if not data['name'].strip():
            errors['name'] = "Name cannot be empty."
        elif not re.match(r'^[a-zA-Z\s]+$', data['name']):
            errors['name'] = "Name should only contain letters and spaces."
        
        # Email validation
        if not data['email'].strip():
            errors['email'] = "Email cannot be empty."
        
        # Subject validation
        if not data['subject'].strip():
            errors['subject'] = "Subject cannot be empty."
        
        # Message validation
        if not data['message'].strip():
            errors['message'] = "Message cannot be empty."
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data