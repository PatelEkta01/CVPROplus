# mongo_utils.py
import pymongo
from django.conf import settings

def get_mongo_connection():
    client = pymongo.MongoClient(settings.MONGO_URI)
    db = client.get_database("ats_resume")  # Use the database specified in the connection URI
    return db