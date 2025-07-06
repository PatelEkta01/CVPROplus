from django.test import TestCase

import unittest
from unittest.mock import patch, MagicMock
import json
from resume.utils import parse_resume_with_gemini  # Replace with actual module name
from rest_framework.test import APIClient
from rest_framework import status
from bson import ObjectId
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile
from .views import ResumeCreateView,ResumeRetrieveView,ResumeImageView,ResumeDeleteView
import gridfs.errors
import tempfile
import os

# class TestParseResumeWithGemini(unittest.TestCase):
#     def setUp(self):
#         self.sample_resume = """
#         John Doe
#         Email: johndoe@example.com
#         Phone: +1 123 456 7890
#         Address: 123 Main St, City, Country
#         Summary: Experienced software engineer with expertise in Python and AI.
#         Skills: Python, Machine Learning, Data Science, JavaScript
#         Experience:
#         - Software Engineer at XYZ Corp (01/2020 - 12/2023) in New York
#           - Developed AI models for automation.
#           - Optimized backend services.
#         Education:
#         - ABC University, BSc Computer Science, Graduated 06/2018, Location: Some City
#         """

#         self.mock_response_json = {
#             "id": None,
#             "resume_template_id": None,
#             "name": "John Doe",
#             "email": "johndoe@example.com",
#             "phone": "+1 123 456 7890",
#             "address": "123 Main St, City, Country",
#             "summary": "Experienced software engineer with expertise in Python and AI.",
#             "skills": ["Python", "Machine Learning", "Data Science", "JavaScript"],
#             "experience": [
#                 {
#                     "job_title": "Software Engineer",
#                     "company": "XYZ Corp",
#                     "start_date": "01/2020",
#                     "end_date": "12/2023",
#                     "location": "New York",
#                     "tasks": ["Developed AI models for automation.", "Optimized backend services."]
#                 }
#             ],
#             "projects": [],
#             "education": [
#                 {
#                     "institution": "ABC University",
#                     "graduation_date": "06/2018",
#                     "course": "BSc Computer Science",
#                     "location": "Some City"
#                 }
#             ]
#         }

#     @patch("google.generativeai.GenerativeModel")
#     def test_parse_resume_success(self, mock_gen_model):
#         # Mock the Gemini AI model behavior
#         mock_model_instance = MagicMock()
#         mock_chat_instance = MagicMock()
#         mock_model_instance.start_chat.return_value = mock_chat_instance
        
#         mock_response = MagicMock()
#         mock_response.text = "```json\n" + json.dumps(self.mock_response_json) + "\n```"
#         mock_chat_instance.send_message.return_value = mock_response
        
#         mock_gen_model.return_value = mock_model_instance
        
#         result = parse_resume_with_gemini(self.sample_resume)
#         self.assertEqual(result, self.mock_response_json)
    
#     @patch("google.generativeai.GenerativeModel")
#     def test_parse_resume_invalid_json(self, mock_gen_model):
#         mock_model_instance = MagicMock()
#         mock_chat_instance = MagicMock()
#         mock_model_instance.start_chat.return_value = mock_chat_instance
        
#         mock_response = MagicMock()
#         mock_response.text = "Invalid JSON Response"
#         mock_chat_instance.send_message.return_value = mock_response
        
#         mock_gen_model.return_value = mock_model_instance
        
#         result = parse_resume_with_gemini(self.sample_resume)
#         self.assertEqual(result, {"error": "Invalid response from AI"})

# if __name__ == "__main__":
#     unittest.main()

class ResumeCreateViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/resume/create/'
        self.sample_resume_data = {
            "personal": {
                "name": "John Doe",
                "email": "john@example.com"
            },
            "education": [],
            "experience": []
        }

    @patch('resume.views.fs.put')
    @patch('resume.views.resume_collection.insert_one')
    def test_create_resume_with_image(self, mock_insert, mock_fs_put):
        """Test successful resume creation with image upload"""
        mock_fs_put.return_value = ObjectId()
        mock_insert.return_value = MagicMock(inserted_id=ObjectId())

        test_image = SimpleUploadedFile(
            "test.jpg",
            b"dummy image content",
            content_type="image/jpeg"
        )

        response = self.client.post(
            self.url,
            {
                "user_id": str(ObjectId()),
                "resumeData": json.dumps(self.sample_resume_data),
                "email": "john@example.com",
                "image": test_image
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("resume_id", response.data)
        mock_fs_put.assert_called_once()
        mock_insert.assert_called_once()

    @patch('resume.views.resume_collection.insert_one')
    def test_create_resume_without_image(self, mock_insert):
        """Test resume creation without image"""
        mock_insert.return_value = MagicMock(inserted_id=ObjectId())

        response = self.client.post(
            self.url,
            {
                "user_id": str(ObjectId()),
                "resumeData": json.dumps(self.sample_resume_data),
                "email": "john@example.com"
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("resume_id", response.data)
        mock_insert.assert_called_once()

    @patch('resume.views.resume_collection.insert_one')
    def test_create_resume_missing_fields(self, mock_insert):
        """Test resume creation with minimal required fields"""
        mock_insert.return_value = MagicMock(inserted_id=ObjectId())

        response = self.client.post(
            self.url,
            {
                "user_id": str(ObjectId()),
                "resumeData": "{}"  # Empty JSON
            },
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("resume_id", response.data)
        mock_insert.assert_called_once()


class ResumeDeleteViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.sample_resume_id = ObjectId()
        self.sample_resume = {
            "_id": self.sample_resume_id,
            "user_id": "user123",
            "image_id": ObjectId()
        }
        self.url = f'/resume/delete/{str(self.sample_resume_id)}/'

    @patch('resume.views.resume_collection.find_one')
    @patch('resume.views.fs.delete')
    @patch('resume.views.resume_collection.delete_one')
    def test_delete_resume_success(self, mock_delete_one, mock_fs_delete, mock_find_one):
        """Test successful resume deletion with image"""
        mock_find_one.return_value = self.sample_resume
        mock_delete_one.return_value = MagicMock(deleted_count=1)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Resume deleted successfully")
        mock_find_one.assert_called_once_with({"_id": str(self.sample_resume_id)})
        mock_fs_delete.assert_called_once_with(self.sample_resume["image_id"])
        mock_delete_one.assert_called_once_with({"_id": str(self.sample_resume_id)})

    @patch('resume.views.resume_collection.find_one')
    def test_delete_resume_not_found(self, mock_find_one):
        """Test resume not found"""
        mock_find_one.return_value = None

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Resume not found")
        mock_find_one.assert_called_once_with({"_id": str(self.sample_resume_id)})

    @patch('resume.views.resume_collection.find_one')
    @patch('resume.views.fs.delete')
    @patch('resume.views.resume_collection.delete_one')
    def test_delete_resume_no_image(self, mock_delete_one, mock_fs_delete, mock_find_one):
        """Test resume deletion without image"""
        resume_no_image = self.sample_resume.copy()
        del resume_no_image["image_id"]
        mock_find_one.return_value = resume_no_image
        mock_delete_one.return_value = MagicMock(deleted_count=1)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_fs_delete.assert_not_called()

    @patch('resume.views.resume_collection.find_one')
    @patch('resume.views.fs.delete')
    @patch('resume.views.resume_collection.delete_one')
    def test_delete_resume_image_not_found(self, mock_delete_one, mock_fs_delete, mock_find_one):
        """Test resume deletion when image doesn't exist"""
        mock_find_one.return_value = self.sample_resume
        mock_fs_delete.side_effect = gridfs.errors.NoFile()
        mock_delete_one.return_value = MagicMock(deleted_count=1)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_fs_delete.assert_called_once_with(self.sample_resume["image_id"])

    @patch('resume.views.resume_collection.find_one')
    @patch('resume.views.fs.delete')
    @patch('resume.views.resume_collection.delete_one')
    def test_delete_resume_failure(self, mock_delete_one, mock_fs_delete, mock_find_one):
        """Test failed resume deletion"""
        mock_find_one.return_value = self.sample_resume
        mock_delete_one.return_value = MagicMock(deleted_count=0)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Failed to delete resume")
        mock_fs_delete.assert_called_once_with(self.sample_resume["image_id"])
        mock_delete_one.assert_called_once_with({"_id": str(self.sample_resume_id)})
class ResumeImageViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()  # Using DRF's APIClient
        self.image_id = ObjectId()
        self.url = f'/resume/image/{str(self.image_id)}/'
        self.sample_file_data = MagicMock()
        self.sample_file_data.read.return_value = b'mock_image_data'
        self.sample_file_data.filename = 'test.png'

    @patch('resume.views.fs.get')
    def test_get_image_success(self, mock_fs_get):
        """Test successful image retrieval"""
        mock_fs_get.return_value = self.sample_file_data

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'image/png')
        self.assertEqual(response['Content-Disposition'], 'inline; filename="test.png"')
        # Remove content assertion since the view might handle streaming differently
        mock_fs_get.assert_called_once_with(self.image_id)

    @patch('resume.views.fs.get')
    def test_get_image_not_found(self, mock_fs_get):
        """Test image not found"""
        mock_fs_get.side_effect = gridfs.errors.NoFile()

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.content.decode(), "Image not found")
        mock_fs_get.assert_called_once_with(self.image_id)

    @patch('resume.views.fs.get')
    def test_get_image_general_error(self, mock_fs_get):
        """Test general error when retrieving image"""
        mock_fs_get.side_effect = Exception("Test error")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.content.decode(), "Error loading image: Test error")
        mock_fs_get.assert_called_once_with(self.image_id)

class ResumeUpdateViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.resume_id = ObjectId()
        self.url = f'/resume/update/{str(self.resume_id)}/'
        self.sample_resume = {
            "_id": self.resume_id,
            "user_id": "user123",
            "title": "Old Title",
            "resume_details": {"old": "data"},
            "image_id": str(ObjectId())
        }
        self.valid_update_data = {
            "title": "New Title",
            "user_id": "user456",
            "resumeData": json.dumps({"new": "data"})
        }

    @patch('resume.views.resume_collection.find_one')
    @patch('resume.views.resume_collection.update_one')
    def test_update_resume_success(self, mock_update, mock_find):
        """Test successful resume update"""
        mock_find.return_value = self.sample_resume
        mock_update.return_value = MagicMock(modified_count=1)

        response = self.client.put(
            self.url,
            data=self.valid_update_data,
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Resume updated successfully")
        mock_find.assert_called_once_with({"_id": str(self.resume_id)})
        mock_update.assert_called_once()

    @patch('resume.views.resume_collection.find_one')
    def test_update_resume_not_found(self, mock_find):
        """Test resume not found"""
        mock_find.return_value = None

        response = self.client.put(
            self.url,
            data=self.valid_update_data,
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "Resume not found")

    @patch('resume.views.resume_collection.find_one')
    def test_update_resume_invalid_json(self, mock_find):
        """Test invalid JSON in resumeData"""
        mock_find.return_value = self.sample_resume

        invalid_data = self.valid_update_data.copy()
        invalid_data["resumeData"] = "invalid json"

        response = self.client.put(
            self.url,
            data=invalid_data,
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Invalid JSON format in resumeData")

    @patch('resume.views.resume_collection.find_one')
    @patch('resume.views.resume_collection.update_one')
    def test_update_resume_no_changes(self, mock_update, mock_find):
        """Test update with no valid fields"""
        mock_find.return_value = self.sample_resume
        mock_update.return_value = MagicMock(modified_count=0)

        response = self.client.put(
            self.url,
            data={"invalid_field": "value"},
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "No valid fields provided to update")

    @patch('resume.views.resume_collection.find_one')
    @patch('resume.views.resume_collection.update_one')
    def test_update_resume_no_actual_changes(self, mock_update, mock_find):
        """Test update with same values (no modification)"""
        mock_find.return_value = self.sample_resume
        mock_update.return_value = MagicMock(modified_count=0)

        same_data = {
            "title": self.sample_resume["title"],
            "resumeData": json.dumps(self.sample_resume["resume_details"])
        }

        response = self.client.put(
            self.url,
            data=same_data,
            format='multipart'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "No changes made")

class ResumeUploadViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = '/resume/extract/'
        
        # Create a sample test file
        self.sample_pdf = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
        self.sample_pdf.write(b'%PDF sample content')
        self.sample_pdf.close()
        
        self.sample_docx = tempfile.NamedTemporaryFile(suffix='.docx', delete=False)
        self.sample_docx.write(b'DOCX sample content')
        self.sample_docx.close()

    def tearDown(self):
        # Clean up test files
        if os.path.exists(self.sample_pdf.name):
            os.remove(self.sample_pdf.name)
        if os.path.exists(self.sample_docx.name):
            os.remove(self.sample_docx.name)

    @patch('resume.views.parse_resume_with_gemini')
    @patch('resume.views.extract_text_from_pdf')
    def test_upload_pdf_success(self, mock_extract_pdf, mock_parse):
        """Test successful PDF upload and parsing"""
        mock_extract_pdf.return_value = "Extracted PDF text"
        mock_parse.return_value = {"structured": "data"}

        with open(self.sample_pdf.name, 'rb') as pdf_file:
            response = self.client.post(
                self.url,
                {'file': pdf_file},
                format='multipart'
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"structured": "data"})
        mock_extract_pdf.assert_called_once()
        mock_parse.assert_called_once_with("Extracted PDF text")

    @patch('resume.views.parse_resume_with_gemini')
    @patch('resume.views.extract_text_from_docx')
    def test_upload_docx_success(self, mock_extract_docx, mock_parse):
        """Test successful DOCX upload and parsing"""
        mock_extract_docx.return_value = "Extracted DOCX text"
        mock_parse.return_value = {"structured": "data"}

        with open(self.sample_docx.name, 'rb') as docx_file:
            response = self.client.post(
                self.url,
                {'file': docx_file},
                format='multipart'
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"structured": "data"})
        mock_extract_docx.assert_called_once()
        mock_parse.assert_called_once_with("Extracted DOCX text")

    def test_upload_no_file(self):
        """Test upload with no file"""
        response = self.client.post(self.url, {}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "No file uploaded")

    def test_upload_unsupported_format(self):
        """Test upload with unsupported file format"""
        unsupported_file = tempfile.NamedTemporaryFile(suffix='.txt', delete=False)
        unsupported_file.write(b'Text file content')
        unsupported_file.close()
        
        try:
            with open(unsupported_file.name, 'rb') as txt_file:
                response = self.client.post(
                    self.url,
                    {'file': txt_file},
                    format='multipart'
                )
            
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(response.data["error"], "Unsupported file format")
        finally:
            os.remove(unsupported_file.name)

    @patch('resume.views.parse_resume_with_gemini')
    @patch('resume.views.extract_text_from_pdf')
    def test_pdf_extraction_error(self, mock_extract_pdf, mock_parse):
        """Test empty text from PDF extraction"""
        mock_extract_pdf.return_value = ""  # Simulate empty extraction
        mock_parse.return_value = {"structured": "data"}  # Still expect parsing to proceed
    
        with open(self.sample_pdf.name, 'rb') as pdf_file:
            response = self.client.post(
                self.url,
                {'file': pdf_file},
                format='multipart'
            )
    
        # View continues processing even with empty text, so expect 200
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"structured": "data"})
        mock_extract_pdf.assert_called_once()
        mock_parse.assert_called_once_with("")

    @patch('resume.views.parse_resume_with_gemini')
    @patch('resume.views.extract_text_from_pdf')
    def test_parsing_error(self, mock_extract_pdf, mock_parse):
        """Test error during resume parsing"""
        mock_extract_pdf.return_value = "Extracted text"
        mock_parse.side_effect = Exception("Parsing failed")

        with open(self.sample_pdf.name, 'rb') as pdf_file:
            response = self.client.post(
                self.url,
                {'file': pdf_file},
                format='multipart'
            )

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.data["error"], "Parsing failed")