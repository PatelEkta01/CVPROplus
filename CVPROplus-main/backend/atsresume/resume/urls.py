from django.urls import path
from .views import  ResumeCreateView, ResumeRetrieveView, ResumeUpdateView, ResumeDeleteView, ResumeUploadView,ResumeImageView

urlpatterns = [
    path("create/", ResumeCreateView.as_view(), name="resume-create"),
    path("retrieve/", ResumeRetrieveView.as_view(), name="resume-retrieve"),  # Get by ID or email
    path("update/<str:id>/", ResumeUpdateView.as_view(), name="resume-update"),
    path("delete/<str:id>/", ResumeDeleteView.as_view(), name="resume-delete"),
    path('extract/', ResumeUploadView.as_view(), name='resume-data-extract'),
    path('image/<str:image_id>/', ResumeImageView.as_view(), name='resume-data-upload'),   
]