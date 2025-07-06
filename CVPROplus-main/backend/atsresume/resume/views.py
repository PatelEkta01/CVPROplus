import json
from bson import ObjectId
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FormParser,MultiPartParser
from .utils import extract_text_from_pdf, extract_text_from_docx, parse_resume, parse_resume_with_gemini
from bson import ObjectId
from rest_framework.permissions import IsAuthenticated
from django.views import View   
from bson import ObjectId
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
import PyPDF2
import io
from datetime import datetime

from db_connection import get_mongo_connection
import gridfs
# Get MongoDB collection

#imports for resume upload
import tempfile
import os
import pdfplumber
import docx
from .utils import parse_resume_with_gemini  # Import LLM function

db = get_mongo_connection()
fs = gridfs.GridFS(db)

resume_collection = db["resumes"]  # Using "resumes" collection

class ResumeCreateView(APIView):
    parser_classes = (MultiPartParser, FormParser)  # Allow file uploads

    """
    API to create a new resume document with an image template.
    """
    def post(self, request):
        data = request.data
        resume_id = str(ObjectId())  # Assign unique ObjectId as a string
        user_id = data.get("user_id")

        # Handle image upload
        image_id = None
        if "image" in request.FILES:
            uploaded_image = request.FILES["image"]
            print(uploaded_image)
            image_id = fs.put(uploaded_image, filename=uploaded_image.name)

        # Prepare resume data
        resume_data = {
            "_id": resume_id,
            "user_id": user_id,
            "title":"",
            "resume_details": json.loads(data.get("resumeData", {})),
            "email": data.get("email", ""),
            "image_id": str(image_id) if image_id else None
        }

        # Save to database
        resume_collection.insert_one(resume_data)
        return Response({"message": "Resume saved successfully", "resume_id": resume_id}, status=201)

class ResumeUpdateView(APIView):
    """
    API to update an existing resume by ID, including updating the image.
    """
    parser_classes = (MultiPartParser, FormParser)  # Allow file uploads

    def put(self, request, id):
        updated_data = request.data
        print(updated_data)

        resume = resume_collection.find_one({"_id": id})
        print(resume)
        if not resume:
            return Response({"error": "Resume not found"}, status=404)

        update_fields = {}  # Store only provided fields

        if "title" in updated_data:
            update_fields["title"] = updated_data.get("title")

        # Update user_id if present
        if "user_id" in updated_data:
            update_fields["user_id"] = updated_data.get("user_id")

        # Extract and parse JSON from resumeData only if present
        if "resumeData" in updated_data:
            try:
                resume_details = json.loads(updated_data["resumeData"])
                update_fields["resume_details"] = resume_details  # Only update if provided
            except json.JSONDecodeError:
                return Response({"error": "Invalid JSON format in resumeData"}, status=400)

        # Handle image update if new image is uploaded
        if "image" in request.FILES:
            uploaded_image = request.FILES["image"]
            image_id = fs.put(uploaded_image, filename=uploaded_image.name)  # Save new image to GridFS

            # Remove old image if exists
            if resume.get("image_id"):
                try:
                    fs.delete(ObjectId(resume["image_id"]))  # Delete old image from GridFS
                except gridfs.errors.NoFile:
                    pass

            update_fields["image_id"] = str(image_id)  # Store new image ID

      

        # Only update if there are changes
        if update_fields:
            print(update_fields)
            result = resume_collection.update_one({"_id": id}, {"$set": update_fields})
            if result.modified_count:
                return Response({"message": "Resume updated successfully"}, status=200)
            return Response({"error": "No changes made"}, status=400)

        return Response({"error": "No valid fields provided to update"}, status=400)
    

class ResumeRetrieveView(APIView):
    """
    API to retrieve resumes, including the associated image.
    """
    def get(self, request):
        email = request.query_params.get("email")
        resume_id = request.query_params.get("id")
        user_id = request.query_params.get("user_id")

        if resume_id:
            resume = resume_collection.find_one({"_id": resume_id})
            if resume:
                resume["_id"] = str(resume["_id"])
                if "image_id" in resume and resume["image_id"]:
                    resume["image_url"] = f"{resume['image_id']}"
                return Response(resume, status=200)
            return Response({"error": "Resume not found"}, status=404)

        if user_id:
            resumes = list(resume_collection.find({"user_id": user_id}))
            for resume in resumes:
                resume["_id"] = str(resume["_id"])
                if "image_id" in resume and resume["image_id"]:
                    resume["image_url"] = f"{resume['image_id']}"
            return Response(resumes, status=200)

        if email:
            resumes = list(resume_collection.find({"email": email}))
            for resume in resumes:
                resume["_id"] = str(resume["_id"])
                if "image_id" in resume and resume["image_id"]:
                    resume["image_url"] = f"{resume['image_id']}"
            return Response(resumes, status=200)

        return Response({"error": "Please provide email, user ID, or resume ID"}, status=400)





class ResumeDeleteView(APIView):
    """
    API to delete a resume by ID, including deleting the associated image.
    """
    def delete(self, request, id):
        resume = resume_collection.find_one({"_id": id})

        if not resume:
            return Response({"error": "Resume not found"}, status=404)

        # Delete image from GridFS
        if "image_id" in resume and resume["image_id"]:
            try:
                fs.delete(ObjectId(resume["image_id"]))
            except gridfs.errors.NoFile:
                pass

        result = resume_collection.delete_one({"_id": id})

        if result.deleted_count:
            return Response({"message": "Resume deleted successfully"}, status=200)
        return Response({"error": "Failed to delete resume"}, status=400)

class ResumeImageView(View):
    """
    API to serve images stored in GridFS.
    """
    def get(self, request, image_id):
        try:
            file_data = fs.get(ObjectId(image_id))  # Get file from GridFS
            response = HttpResponse(file_data, content_type="image/png")  # ✅ Ensure binary response
            response["Content-Disposition"] = f'inline; filename="{file_data.filename}"'
            return response
        except gridfs.errors.NoFile:
            return HttpResponse("Image not found", status=404)
        except Exception as e:
            return HttpResponse(f"Error loading image: {str(e)}", status=500)



class ResumeUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded"}, status=400)

        uploaded_file = request.FILES['file']
        file_extension = uploaded_file.name.split('.')[-1].lower()

        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        try:
            if file_extension == "pdf":
                extracted_text = extract_text_from_pdf(temp_file_path)
            elif file_extension in ["doc", "docx"]:
                extracted_text = extract_text_from_docx(temp_file_path)
            else:
                return Response({"error": "Unsupported file format"}, status=400)

            # Call LLM function for structured resume parsing
            extracted_data = parse_resume_with_gemini(extracted_text)
            return Response(extracted_data, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        finally:
            os.remove(temp_file_path)  # Clean up temp file

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file"""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

def extract_text_from_docx(docx_path):
    """Extract text from a DOCX file"""
    try:
        doc = docx.Document(docx_path)
        return "\n".join([para.text for para in doc.paragraphs]).strip()
    except Exception as e:
        print(f"Error extracting text from DOCX: {e}")
        return ""