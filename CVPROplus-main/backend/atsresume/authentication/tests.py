from datetime import datetime, timedelta
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from .views import LoginView, RegisterUserView, ForgotPasswordView, VerifyTokenView, ResetPasswordView, ContactUsView
from bson import ObjectId
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.conf import settings
import jwt


class RegisterUserViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('authentication.views.user_collection')
    def test_register_success(self, mock_user_collection):
        mock_user_collection.find_one.return_value = None
        mock_user_collection.insert_one.return_value = MagicMock(inserted_id=ObjectId())

        request_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'password': 'Password123!'
        }

        response = self.client.post('/auth/register/', request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('username', response.data)

    @patch('authentication.views.user_collection')
    def test_register_duplicate_email(self, mock_user_collection):
        mock_user_collection.find_one.return_value = {'email': 'john@example.com'}

        request_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'password': 'Password123!'
        }

        response = self.client.post('/auth/register/', request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_register_missing_fields(self):
        request_data = {
            'first_name': 'John',
            'email': 'john@example.com',
            'password': 'Password123!'
        }

        response = self.client.post('/auth/register/', request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('last_name', response.data)

    @patch('authentication.views.user_collection')
    def test_register_bad_password(self, mock_user_collection):
        mock_user_collection.find_one.return_value = None

        request_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'password': 'password'
        }

        response = self.client.post('/auth/register/', request_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)


class LoginViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('authentication.views.user_collection')
    def test_login_success(self, mock_user_collection):
        mock_user_collection.find_one.return_value = {
            '_id': ObjectId(),
            'email': 'john@example.com',
            'password': make_password('password123')
        }

        response = self.client.post('/auth/login/', {
            'email': 'john@example.com',
            'password': 'password123'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)

    @patch('authentication.views.user_collection')
    def test_login_bad_password(self, mock_user_collection):
        mock_user_collection.find_one.return_value = {
            '_id': ObjectId(),
            'email': 'john@example.com',
            'password': make_password('password123')
        }

        response = self.client.post('/auth/login/', {
            'email': 'john@example.com',
            'password': 'wrongpassword'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_login_missing_fields(self):
        response = self.client.post('/auth/login/', {
            'email': 'john@example.com'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)


class ForgotPasswordViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('authentication.views.user_collection')
    def test_forgot_pass_success(self, mock_user_collection):
        mock_user_collection.find_one.return_value = {'email': 'john@example.com'}

        response = self.client.post('/auth/forgot-password/', {
            'email': 'john@example.com'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    @patch('authentication.views.user_collection')
    def test_forgot_pass_bad_email(self, mock_user_collection):
        mock_user_collection.find_one.return_value = None

        response = self.client.post('/auth/forgot-password/', {
            'email': 'nonexistent@example.com'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

    def test_forgot_pass_missing_email(self):
        response = self.client.post('/auth/forgot-password/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)


class VerifyTokenViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/auth/verify-otp/'
        self.expired_time = datetime.now(timezone.utc) - timedelta(minutes=10)
        self.future_time = datetime.now(timezone.utc) + timedelta(minutes=10)

    @patch('authentication.views.user_collection.find_one')
    def test_verify_token_success(self, mock_find):
        mock_find.return_value = {
            'email': 'user@example.com',
            'reset_token': '123456',
            'token_expiry': self.future_time
        }

        response = self.client.post(self.url, {
            'email': 'user@example.com',
            'token': '123456'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @patch('authentication.views.user_collection.find_one')
    def test_verify_token_no_user(self, mock_find):
        mock_find.return_value = None
        response = self.client.post(self.url, {
            'email': 'user@example.com',
            'token': '123456'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch('authentication.views.user_collection.find_one')
    def test_verify_token_invalid(self, mock_find):
        mock_find.return_value = {
            'email': 'user@example.com',
            'reset_token': '654321',
            'token_expiry': self.future_time
        }
        response = self.client.post(self.url, {
            'email': 'user@example.com',
            'token': '123456'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('authentication.views.user_collection.update_one')
    @patch('authentication.views.user_collection.find_one')
    def test_verify_token_expired(self, mock_find, mock_update):
        mock_find.return_value = {
            'email': 'user@example.com',
            'reset_token': '123456',
            'token_expiry': self.expired_time
        }
        mock_update.return_value = MagicMock()
        response = self.client.post(self.url, {
            'email': 'user@example.com',
            'token': '123456'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ResetPasswordViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('authentication.views.user_collection')
    def test_reset_pass_success(self, mock_user_collection):
        mock_user_collection.find_one.return_value = {
            'email': 'john@example.com',
            'reset_token': '123456',
            'token_expiry': datetime.utcnow() + timedelta(minutes=5)
        }

        response = self.client.post('/auth/reset-password/', {
            'email': 'john@example.com',
            'token': '123456',
            'new_password': 'Newpassword123!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    @patch('authentication.views.user_collection')
    def test_reset_pass_expired(self, mock_user_collection):
        mock_user_collection.find_one.return_value = {
            'email': 'john@example.com',
            'reset_token': '123456',
            'token_expiry': datetime.utcnow() - timedelta(minutes=5)
        }

        response = self.client.post('/auth/reset-password/', {
            'email': 'john@example.com',
            'token': '123456',
            'new_password': 'Newpassword123!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    @patch('authentication.views.user_collection')
    def test_reset_pass_no_user(self, mock_user_collection):
        mock_user_collection.find_one.return_value = None

        response = self.client.post('/auth/reset-password/', {
            'email': 'nonexistent@example.com',
            'token': '123456',
            'new_password': 'Newpassword123!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

    def test_reset_pass_missing_fields(self):
        response = self.client.post('/auth/reset-password/', {
            'email': 'john@example.com',
            'token': '123456'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_password', response.data)


class ContactUsViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/auth/contact-us/'

    @patch('authentication.views.contact_collection.insert_one')
    def test_contact_success(self, mock_insert):
        mock_insert.return_value = MagicMock()
        response = self.client.post(self.url, {
            'name': 'John Doe',
            'email': 'john@example.com',
            'message': 'Test message',
            'subject': 'Test subject'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_contact_missing_fields(self):
        test_cases = [
            {'email': 'john@example.com', 'message': 'Hello'},
            {'name': 'John Doe', 'message': 'Hello'},
            {'name': 'John Doe', 'email': 'john@example.com'}
        ]

        for payload in test_cases:
            with self.subTest(payload=payload):
                response = self.client.post(self.url, payload, format='json')
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class GoogleLoginViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/auth/google-login/'
        self.google_data = {
            'email': 'user@example.com',
            'given_name': 'John',
            'family_name': 'Doe'
        }

    @patch('authentication.views.login_log_collection.insert_one')
    @patch('authentication.views.user_collection.find_one')
    @patch('authentication.views.id_token.verify_oauth2_token')
    def test_google_login_success(self, mock_verify, mock_find, mock_log):
        mock_verify.return_value = self.google_data
        mock_find.return_value = None
        mock_insert = MagicMock(inserted_id='507f1f77bcf86cd799439011')
        
        with patch('authentication.views.user_collection.insert_one', return_value=mock_insert):
            with patch('authentication.views.jwt.encode', return_value='jwt_token'):
                response = self.client.post(self.url, {
                    'token': 'valid_google_token',
                    'location': {'city': 'New York'}
                }, format='json')
                self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_google_login_missing_token(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('authentication.views.id_token.verify_oauth2_token')
    def test_google_login_bad_token(self, mock_verify):
        mock_verify.side_effect = ValueError("Invalid token")
        response = self.client.post(self.url, {
            'token': 'invalid_token',
            'location': {'city': 'New York'}
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('authentication.views.id_token.verify_oauth2_token')
    def test_google_login_no_email(self, mock_verify):
        mock_data = self.google_data.copy()
        mock_data.pop('email')
        mock_verify.return_value = mock_data
        response = self.client.post(self.url, {
            'token': 'valid_google_token',
            'location': {'city': 'New York'}
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)