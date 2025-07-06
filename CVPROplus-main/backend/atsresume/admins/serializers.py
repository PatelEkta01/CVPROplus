from rest_framework import serializers

class AdminRegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=255)
    last_name = serializers.CharField(max_length=255)  # Required field
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    