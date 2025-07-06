from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from bson import ObjectId
from django.contrib.auth.hashers import make_password
from .models import admin_collection, user_collection, resume_collection, login_log_collection
from .views import AdminLoginLogsView, AdminLoginView, AdminRegisterView, AdminUserListView, AdminAllResumesView, AdminDeleteUserView
from admins.serializers import AdminRegisterSerializer

class AdminUserListViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/admins/users/'

    @patch('admins.views.user_collection.find')
    @patch('admins.views.resume_collection.count_documents')
    def test_get_user_list_success(self, mock_count, mock_find):
        """Test successful retrieval of non-admin users with resume counts"""
        mock_user = {
            '_id': ObjectId(),
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'role': 'user'
        }
        mock_find.return_value = [mock_user]
        mock_count.return_value = 3

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['users']), 1)
        self.assertEqual(response.data['users'][0]['email'], 'john@example.com')
        self.assertEqual(response.data['users'][0]['total_resumes'], 3)

    @patch('admins.views.user_collection.find')
    def test_get_empty_user_list(self, mock_find):
        """Test empty user list response"""
        mock_find.return_value = []
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data.get('users', [])), 0)

    @patch('admins.views.user_collection.find')
    def test_database_error(self, mock_find):
        """Test database exception handling"""
        mock_find.side_effect = Exception("Database connection failed")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)

class AdminAllResumesViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/admins/resumes/'

    @patch('admins.views.resume_collection.find')
    def test_get_all_resumes_success(self, mock_find):
        """Test successful retrieval of all resumes with complete data"""
        test_resume = {
            '_id': ObjectId(),
            'user_id': '67c2ddd26ad3bf101453a3c1',
            'title': 'Software Engineer',
            'email': 'test@example.com',
            'image_id': '67d7b53a81a62c5d5fa0dcfc',
            'resume_details': {
                'personal': {
                    'name': 'John Doe',
                    'email': 'john@example.com',
                    'phone': '1234567890',
                    'address': '123 Main St'
                },
                'education': [{
                    'institution': 'University',
                    'graduationDate': '2023',
                    'course': 'Computer Science'
                }],
                'skills': ['Python', 'Django']
            }
        }
        mock_find.return_value = [test_resume]

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['resumes']), 1)
        
        resume_data = response.data['resumes'][0]
        self.assertEqual(resume_data['user_id'], '67c2ddd26ad3bf101453a3c1')
        self.assertEqual(resume_data['title'], 'Software Engineer')
        self.assertEqual(resume_data['personal_info']['name'], 'John Doe')

    @patch('admins.views.resume_collection.find')
    def test_get_empty_resume_list(self, mock_find):
        """Test empty resume list response"""
        mock_find.return_value = []

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['resumes']), 0)

    @patch('admins.views.resume_collection.find')
    def test_partial_resume_data(self, mock_find):
        """Test handling of resumes with missing fields"""
        test_resume = {
            '_id': ObjectId(),
            'user_id': '67c2ddd26ad3bf101453a3c1',
            'resume_details': {
                'personal': {
                    'name': 'Jane Doe'
                }
            }
        }
        mock_find.return_value = [test_resume]

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        resume_data = response.data['resumes'][0]
        self.assertEqual(resume_data['title'], "")
        self.assertEqual(resume_data['personal_info']['name'], 'Jane Doe')
        self.assertEqual(resume_data['education'], [])

    @patch('admins.views.resume_collection.find')
    def test_database_error(self, mock_find):
        """Test database exception handling"""
        mock_find.side_effect = Exception("Database connection failed")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)

class AdminDeleteUserViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.valid_id = '507f1f77bcf86cd799439011'
        self.invalid_id = 'invalid-id'
        self.nonexistent_id = '000000000000000000000000'

    @patch('admins.views.resume_collection.delete_many')
    @patch('admins.views.user_collection.delete_one')
    @patch('admins.views.user_collection.find_one')
    def test_delete_user_success(self, mock_find, mock_user_delete, mock_resume_delete):
        mock_find.return_value = {'_id': ObjectId(self.valid_id)}
        mock_user_delete.return_value = MagicMock(deleted_count=1)
        mock_resume_delete.return_value = MagicMock(deleted_count=2)

        response = self.client.delete(f'/admins/deleteusers/{self.valid_id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    @patch('admins.views.user_collection.find_one')
    def test_delete_nonexistent_user(self, mock_find):
        mock_find.return_value = None

        response = self.client.delete(f'/admins/deleteusers/{self.nonexistent_id}/')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)

    def test_delete_invalid_user_id(self):
        response = self.client.delete(f'/admins/deleteusers/{self.invalid_id}/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    @patch('admins.views.user_collection.delete_one')
    @patch('admins.views.user_collection.find_one')
    def test_database_error_on_delete(self, mock_find, mock_delete):
        mock_find.return_value = {'_id': ObjectId(self.valid_id)}
        mock_delete.side_effect = Exception("Deletion failed")

        response = self.client.delete(f'/admins/deleteusers/{self.valid_id}/')
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)

class AdminLoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch('admins.views.admin_collection.find_one')
    def test_admin_login_success(self, mock_find):
        mock_find.return_value = {
            '_id': ObjectId(),
            'first_name': 'Admin',
            'last_name': 'User',
            'email': 'admin@example.com',
            'password': make_password('adminpass'),
            'role': 'admin'
        }

        data = {
            "email": "admin@example.com",
            "password": "adminpass"
        }

        response = self.client.post('/admins/login/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        self.assertEqual(response.data['user']['role'], 'admin')

    @patch('admins.views.admin_collection.find_one')
    def test_non_admin_login_should_fail(self, mock_find):
        mock_find.return_value = {
            '_id': ObjectId(),
            'first_name': 'Normal',
            'last_name': 'User',
            'email': 'user@example.com',
            'password': make_password('userpass'),
            'role': 'user'
        }

        data = {
            "email": "user@example.com",
            "password": "userpass"
        }

        response = self.client.post('/admins/login/', data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'Unauthorized. Only admin are allowed to log in.')

class AdminRegisterViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/admins/register/'
        self.valid_data = {
            'first_name': 'Admin',
            'last_name': 'User',
            'email': 'admin@example.com',
            'password': 'securepassword123'
        }

    @patch('admins.views.admin_collection.find_one')
    @patch('admins.views.admin_collection.insert_one')
    def test_register_admin_success(self, mock_insert, mock_find):
        """Test successful admin registration"""
        mock_find.return_value = None  # No existing user
        mock_insert.return_value = MagicMock(inserted_id=ObjectId())

        response = self.client.post(self.url, self.valid_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], 'admin@example.com')
        self.assertEqual(response.data['role'], 'admin')
        self.assertIn('admin_username', response.data)

    @patch('admins.views.admin_collection.find_one')
    def test_register_existing_email(self, mock_find):
        """Test registration with existing email"""
        mock_find.return_value = {'email': 'admin@example.com'}  # Existing user

        response = self.client.post(self.url, self.valid_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['email'], 'This email is already registered.')

    def test_register_invalid_data(self):
        """Test registration with invalid data"""
        invalid_data = {
            'first_name': '',  # Empty first name
            'last_name': 'User',
            'email': 'not-an-email',
            'password': '123'  # Too short
        }

        response = self.client.post(self.url, invalid_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('first_name', response.data)
        self.assertIn('email', response.data)
        self.assertIn('password', response.data)

    @patch('admins.views.admin_collection.find_one')
    @patch('admins.views.admin_collection.insert_one')
    def test_password_hashing(self, mock_insert, mock_find):
        """Test that password is properly hashed"""
        mock_find.return_value = None
        mock_insert.return_value = MagicMock(inserted_id=ObjectId())

        test_password = 'securepassword123'
        data = self.valid_data.copy()
        data['password'] = test_password

        response = self.client.post(self.url, data, format='json')

        # Get the arguments passed to insert_one
        called_args, _ = mock_insert.call_args
        inserted_data = called_args[0] if called_args else {}

        self.assertTrue('password' in inserted_data)
        self.assertNotEqual(inserted_data['password'], test_password)
        self.assertTrue(inserted_data['password'].startswith('pbkdf2_sha256$'))

    @patch('admins.views.admin_collection.find_one')
    @patch('admins.views.admin_collection.insert_one')
    def test_username_generation(self, mock_insert, mock_find):
        """Test that username is properly generated"""
        mock_find.return_value = None
        mock_insert.return_value = MagicMock(inserted_id=ObjectId())

        data = self.valid_data.copy()
        data['first_name'] = 'Test'
        data['last_name'] = 'User'

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('admin_username', response.data)
        self.assertTrue(response.data['admin_username'].startswith('testuser'))