# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy only the requirements file first to leverage Docker's caching
COPY requirements.txt /app/
FROM python:3.11-slim

WORKDIR /app

COPY . /app

# Install dependencies 
RUN pip install --no-cache-dir -r requirements.txt && pip install gunicorn
RUN python -m spacy download en_core_web_sm

# Expose the port
EXPOSE 8000

# Run migrations, collect static files, and start Gunicorn server
ENTRYPOINT ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn --bind 0.0.0.0:8000 --workers=4 --threads=2 atsresume.wsgi:application"]
