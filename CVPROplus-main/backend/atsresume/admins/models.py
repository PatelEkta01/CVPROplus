from django.db import models
from db_connection import get_mongo_connection
# Create your models here.
db=get_mongo_connection()
user_collection=db['users']
admin_collection=db['admins']
resume_collection = db["resumes"]
login_log_collection = db["login_logs"]