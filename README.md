# ATS Resume Builder and Analyzer

A powerful web application that helps users create, edit, and analyze resumes for ATS (Applicant Tracking System) compatibility. The application features a modern UI, real-time resume analysis, and multiple resume templates.

## Features

- **Resume Creation**: Create professional resumes using our custom templates
- **Resume Analysis**: Get instant AI-powered feedback on your resume's ATS compatibility
- **Template Selection**: Choose from custom professional or fresher resume templates
- **Real-time Preview**: See your resume changes in real-time
- **PDF Export**: Export your resume in PDF and DOC format
- **Job Tailored Resume**: Add in a job description to custom-tailor your resume
- **Resume Management**: View, edit, and delete your saved resumes
- **User Authentication**: Secure user accounts and data management

## Dependencies

### Backend (Python/Django)

```bash
# Core Dependencies
asgiref==3.8.1
cachetools==5.5.1
certifi==2025.1.31
charset-normalizer==3.4.1
Django==3.1.12
django-cors-headers==3.5.0
djangorestframework==3.12.4
djangorestframework-simplejwt==5.2.2
djongo==1.3.7
dnspython==2.3.0
httplib2==0.22.0
idna==3.10
oauthlib==3.2.2
pyasn1==0.6.1
pyasn1_modules==0.4.1
PyJWT==2.8.0
pymongo==3.11.4
pyparsing==3.2.1
python-dotenv==0.21.1
pytz==2025.1
requests==2.32.3
requests-oauthlib==2.0.0
rsa==4.9
sqlparse==0.2.4
typing_extensions==4.12.2
urllib3==2.3.0

# AI/ML and PDF Processing
google-api-python-client
google-auth==2.38.0
google-auth-oauthlib
google-auth-httplib2
google-generativeai
pdfplumber
python-docx
spacy
en-core-web-sm @ https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.0/en_core_web_sm-3.7.0.tar.gz
phonenumbers
PyPDF2
coverage
```

### Frontend (React)

```bash
# Core Dependencies
react==18.2.0
react-dom==18.2.0
react-router-dom==6.21.1
axios==1.6.2

# UI Components
@heroicons/react==2.0.18
@headlessui/react==1.7.17
tailwindcss==3.3.6
postcss==8.4.32

# PDF Processing
html2canvas==1.4.1
jspdf==2.5.1
pdfjs-dist==4.0.379
```

## Build and Deployment Instructions

### Prerequisites

1. Python 3.8 or higher (use `python3` command if `python` doesn't work)
2. Node.js 16 or higher
3. Access to the project's GitLab repository

### Backend Setup

1. Clone the repository and navigate to the backend directory:
```bash
git clone <repository-url>
cd backend/atsresume
```

2. Create and activate a virtual environment in the backend directory:
```bash
python -m venv venv  # Use python3 if python doesn't work
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Create a `.env` file in the backend/atsresume directory with the following variables:
```bash
MONGO_USERNAME=<your_mongo_username>
MONGO_PASSWORD=<your_mongo_password>
MONGO_CLUSTER_NAME=<your_cluster_name>
MONGO_DB_NAME=<your_database_name>
EMAIL_HOST=<smtp_server>
EMAIL_PORT=<smtp_port>
EMAIL_HOST_USER=<your_email>
EMAIL_HOST_PASSWORD=<your_email_password>
EMAIL_USE_TLS=True
REACT_APP_GEMINI_API_KEY=<your-gemini-api-key>
```

4. Install dependencies from the requirements.txt file:
```bash
pip install -r requirements.txt  # Use pip3 if pip doesn't work
```

5. Run migrations:
```bash
python manage.py migrate  # Use python3 if python doesn't work
```

6. Start the Django server:
```bash
python manage.py runserver  # Use python3 if python doesn't work
```

7. Keep this terminal window open and running the backend server. Open a new terminal window for frontend setup.

### Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
```

2. Create a `.env` file in the frontend directory with the following variables:
```bash
REACT_APP_GEMINI_API_KEY=<your_gemini_api_key>
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm start
```

Note:
- Make sure both servers are setup and running simultaneiosly for the application to run properly. 
- The application uses GitLab CI/CD pipeline for managing environment variables and credentials. For local development, you need to create the `.env` files in both backend and frontend directories with the appropriate variables.

## Usage Scenarios

### 1. Sign Up

1. Click "Sign Up" in the navigation bar
2. On the signup page:
   - Allow location access if you want to provide location data to admin
   - Fill in the signup form with your details to sign up
   - Or click "Sign in with Google" to use your Google account
3. Click "Login" if you already have an account to be redirected to the login page

### 2. Login

1. Enter your registered email and password
2. Check "Remember Me" to auto-fill credentials for future logins
3. Click "Login with Google" to use your Google account
4. Click "Sign up with email" to create a new account
5. Click "Forgot Password" if you need to reset your password

### 3. Forgot Password

1. Enter your registered email address
2. Click "Send OTP" to receive a verification code
3. Click "Back to Login" to exit the feature
4. Enter the verification code received in your email
5. Once verified, set your new password
6. You'll be redirected to the login page
7. Browser password manager may prompt to update saved password

### 4. Creating a New Resume

1. Click "Create Resume" on the dashboard
2. Choose between:
   - Create from scratch ('Create Resume')
   - Upload existing resume ('Upload Resume')
3. If uploading:
   - Click "Upload Resume"
   - Select your local resume file
   - Click "Upload Now"
   - Choose a template
   - Resume builder will auto-fill fields from your uploaded resume
4. If creating from scratch:
   - Select a template
   - Fill in your personal information:
     - Name
     - Contact details
     - Professional summary
   - Add your experience:
     - Job title
     - Company name
     - Duration
     - Responsibilities and achievements
   - Add your education:
     - Institution name
     - Degree
     - Graduation date
   - Add your skills and certifications
5. Preview your resume
6. Save or export as PDF or DOC

### 5. Dashboard (Managing Resumes)

1. Access the Dashboard to manage all your resumes
2. View all resumes created using the website
3. For each resume:
   - Click "View Resume" to open the preview in the website
   - Click "Edit" to modify the resume
   - Click "Delete" to remove the resume

### 6. Analyzing Resume ATS Compatibility

1. Go to the "Rate My Resume" page
2. Upload your resume (PDF format)
3. The system will analyze your resume based on:
   - Contact Information (15 points)
   - Formatting and Structure (10 points)
   - Content Organization (30 points)
   - Keywords and Language (25 points)
   - Professional Impact (20 points)
4. View detailed feedback including:
   - Overall score
   - Strengths
   - Areas for improvement
5. Make necessary changes based on the feedback

### 7. Job Tailored Resume

1. Click the "+" button in the resume builder
2. Paste your job description
3. The system will tailor your current resume based on:
   - Your existing resume content
   - The job description
4. After making additional changes:
   - Click "Refresh" to update the tailored content
   - Use "Reset" to undo changes
   - Multiple resets available until button grays out
5. Review the tailored resume
6. Save or export the tailored version

### 8. About Us Page

1. Navigate to the About Us page from the navigation menu
2. Learn about CVPRO+ features:
   - ATS-Optimized Templates
   - Real-time feedback and keyword suggestions
   - User-friendly interface
   - Secure cloud storage
3. Understand our mission to empower job seekers
4. Access the "Get Started" button to:
   - Create a new account
   - Start building your resume
   - Access all platform features

### 9. Contact Us Page

1. Navigate to the Contact Us page from the navigation menu
2. Fill out the contact form with:
   - Your name
   - Email address
   - Subject
   - Message
3. Submit the form to send your message
4. Alternative contact methods:
   - Email: cvproplus@gmail.com
   - Phone: +1 234 567 890
5. Connect through social media:
   - Facebook
   - WhatsApp
   - Instagram

### 10. Admin Dashboard

1. Access the Admin Dashboard with administrator privileges
2. View and manage users:
   - List of all registered users
   - User details including name, email, and resume count
   - User location data (city and country)
   - Account creation dates
3. Filter users by date range:
   - Select from and to dates
   - View users registered within the selected period
4. Export user data:
   - Download user information in Excel format
   - Includes name, email, resume count, location, and creation date
5. User management actions:
   - View individual user profiles
   - Remove users from the system
6. Analyze software usage patterns:
   - View login activity by hour
   - Identify peak usage hours in UTC timezone
   - Track lowest usage periods
7. Monitor user distribution:
   - View user count by country
   - Analyze geographical distribution of users
   - Track international usage patterns

## CI/CD Pipeline

Our GitLab CI/CD pipeline implements a comprehensive workflow with five stages to ensure code quality and reliable deployment:

### 1. Build Stage
- Builds the project using configured build tools
- Compiles both frontend and backend components
- Creates necessary artifacts for subsequent stages
- Ensures successful compilation of all components

### 2. Test Stage
- Executes 64 comprehensive test cases
- Runs automated tests for both frontend and backend
- Generates test coverage reports
- Stores coverage reports as pipeline artifacts for analysis
- Ensures code reliability and functionality

### 3. Code Quality Stage
- Performs static code analysis
- Identifies code smells and potential issues
- Generates detailed reports of code quality metrics
- Stores analysis results as downloadable artifacts
- Helps maintain code standards and best practices

### 4. Publish Stage
- Packages the application for deployment
- Creates deployment-ready artifacts
- Handles versioning and release management
- Prepares the application for distribution

### 5. Deploy Stage
- Deploys the application to the target environment
- Handles environment-specific configurations
- Ensures smooth deployment process
- Manages rollback procedures if needed

This pipeline ensures:
- Consistent build process
- Comprehensive test coverage
- Code quality standards
- Reliable deployment process
- Traceable development workflow

## Test-Driven Development (TDD)

This project follows Test-Driven Development practices and maintains a comprehensive test suite with 86% line coverage, exceeding the required 75% threshold. Our tests cover all possible scenarios including border conditions and edge cases.

### Test Coverage Highlights
- Overall line coverage: 86%
- Comprehensive test suite covering:
  - Backend API endpoints
  - Frontend components
  - Utility functions
  - Error handling
  - Edge cases and border conditions

### TDD Implementation Examples

#### Admin Registration
- [Test Case 1 for Admin Registration (e7c6b6d3)](https://git.cs.dal.ca/courses/2025-winter/csci-5308/group06/-/commit/e7c6b6d329d61aca7a3fe9d932c3fcac42aeae8f) -> [Implementation (1bcb2535)](https://git.cs.dal.ca/courses/2025-winter/csci-5308/group06/-/commit/1bcb2535ce93bc8767b2974a1394915e6b58a2df)

- [Test Case 2 for Admin Registration (9de3fa29)](https://git.cs.dal.ca/courses/2025-winter/csci-5308/group06/-/commit/9de3fa29927dc4933ea34b3f4375bf10f552524b) -> [Implementation (1a3c4709)](https://git.cs.dal.ca/courses/2025-winter/csci-5308/group06/-/commit/1a3c4709423dd5b2bc92696499e81be0ef1b7fba)

- [Test Case 3 for Admin Registration (3d997945)](https://git.cs.dal.ca/courses/2025-winter/csci-5308/group06/-/commit/3d99794596397a933fd49f5c97fbbdec09f07915) -> [Implementation (662b5ebb)](https://git.cs.dal.ca/courses/2025-winter/csci-5308/group06/-/commit/662b5ebb40f70591f9d1bb39675b7907fc06b72f)

#### Admin Login
- [Test Case 1 for Admin Login (bac9665d)](https://git.cs.dal.ca/courses/2025-winter/csci-5308/group06/-/commit/bac9665d1ac234ed8644625d2f7dc4705709b448) -> [Implementation (9ad84b31)](https://git.cs.dal.ca/courses/2025-winter/csci-5308/group06/-/commit/9ad84b31770998a40d4f89372cf5476c2129fe58)

- [Test Case 2 for Admin Login (5736d8a9)](https://git.cs.dal.ca/courses/2025-winter/csci-5308/group06/-/commit/5736d8a9a2038fb1ee375cf12920647b8edf83b4) -> [Implementation (4bd70a01)](https://git.cs.dal.ca/courses/2025-winter/csci-5308/group06/-/commit/4bd70a01b58beb4f9af717f1033f94402b3d6fec)

## Design Principles

### Clean Code Practices

1. **Method Design**
   - Small, focused methods with clear responsibilities
   - Metrics from function analysis:
     - Average method length: 15-20 lines
     - Most methods have cyclomatic complexity ≤ 3
     - Complex methods (>6 CC) are flagged for refactoring
   - Examples:
     - `extract_email()`: Single responsibility for email extraction
     - `normalize_spaces()`: Focused on text normalization
     - `_generate_username()`: Clear purpose for username generation

2. **Code Documentation**
   - Comments explain the "why" not the "what"
   - Examples:
     ```python
     # Using regex for email validation to ensure RFC 5322 compliance
     # and handle special characters in local part
     def extract_email(text):
         # Implementation
     ```
     ```python
     # Implementing exponential backoff for API retries
     # to handle rate limiting and temporary failures
     def parse_resume_with_gemini():
         # Implementation
     ```

3. **Conditional Logic**
   - Clear, positive conditions
   - No double negatives
   - Examples:
     ```python
     # Good: Clear positive condition
     if is_valid_resume(resume_data):
         process_resume()
     
     # Good: Descriptive variable names
     has_required_fields = all(field in data for field in required_fields)
     if has_required_fields:
         save_resume()
     ```

### Backend Design Principles

1. **Single Responsibility Principle (SRP)**
   - Each module and class has a single, well-defined purpose
   - Metrics:
     - LCOM (Lack of Cohesion of Methods): 0.33
       - Measured in `utils.py` module from class module metrics
     - Average methods per class: 4.1
       - Calculated from class module metrics (NOM values)
   - Examples:
     - `utils.py`: Separates text extraction, parsing, and AI integration into distinct functions
     - `models.py`: Each model class handles one type of data (Resume, User, Admin)
     - `views.py`: Each view function handles one specific API endpoint

2. **Open/Closed Principle (OCP)**
   - System is open for extension but closed for modification
   - Metrics:
     - Extension points: 8
       - Identified through class module metrics (classes with abstract methods)
     - Code reuse ratio: 0.82
       - Based on function metrics analysis (reused functions across modules)
   - Examples:
     - Resume parsing system with extensible parser factory
     - Template system that allows adding new templates without modifying core code
     - Analysis strategies that can be extended for new types of analysis

3. **Interface Segregation Principle (ISP)**
   - Interfaces are specific to client needs
   - Metrics:
     - Interface segregation index: 0.85
       - Based on class module metrics (NOM and NOPM values)
     - Average methods per interface: 3.8
       - Calculated from class module metrics (NOM values)
   - Examples:
     - Separate interfaces for PDF processing and text extraction
     - Distinct interfaces for resume analysis and template rendering
     - Clean separation between data models and business logic

4. **Dependency Inversion Principle (DIP)**
   - High-level modules depend on abstractions
   - Metrics:
     - Dependency inversion ratio: 0.82
       - Based on class module metrics (Fan-in and Fan-out values)
     - Coupling between modules: 0.15
       - Measured through class module metrics (Fan-out values)
   - Examples:
     - Database operations using abstract repository pattern
     - AI service integration through abstract interface
     - File processing using abstract factory pattern

5. **Code Organization**
   - Clear directory structure with modular components
   - Metrics:
     - Directory depth: 3 levels
       - Verified through project structure
     - File organization score: 0.88
       - Based on design smells analysis
       - Two instances of broken modularization identified in models.py files
   - Example structure:
     ```
     backend/
     ├── atsresume/
     │   ├── resume/
     │   │   ├── utils.py        # Text processing and AI integration
     │   │   ├── views.py        # API endpoints
     │   │   └── models.py       # Data models
     │   └── authentication/     # User authentication
     ```

### Frontend Design Principles

1. **Component-Based Architecture**
   - Reusable, self-contained components
   - Examples:
     - `EditorSection`: Self-contained resume editing component
     - `ResumePreview`: Reusable preview component
     - `ExportButton`: Modular export functionality
   - Implementation:
     - Components follow single responsibility principle
     - Props are well-defined with PropTypes
     - Components are modular and reusable

2. **State Management**
   - Centralized state management with clear data flow
   - Examples:
     - React Context for global state
     - Custom hooks for local state management
     - Efficient state updates using useReducer
   - Implementation:
     - Clear separation of concerns
     - Predictable state updates
     - Efficient re-rendering patterns

3. **Code Organization**
   - Feature-based structure with clear separation
   - Example structure:
     ```
     frontend/
     ├── src/
     │   ├── components/        # Reusable UI components
     │   ├── pages/            # Page components
     │   ├── hooks/            # Custom React hooks
     │   ├── services/         # API services
     │   └── utils/            # Utility functions
     ```
   - Implementation:
     - Clear directory structure
     - Consistent file naming
     - Logical grouping of related functionality

## API Endpoints

### Resume Management
- `POST /api/resume/create/` - Create a new resume
- `PUT /api/resume/update/<id>/` - Update an existing resume
- `GET /api/resume/retrieve/` - Get resume(s)
- `DELETE /api/resume/delete/<id>/` - Delete a resume

### Resume Analysis
- `POST /api/resume/upload/` - Upload and analyze a resume
- `GET /api/resume/image/<image_id>/` - Get resume template image

## Error Handling

The application includes comprehensive error handling for:
- File upload issues
- PDF processing errors
- API communication problems
- Database operations
- User authentication
- Form validation

## Security Features

- Secure user authentication
- Protected API endpoints
- CI/CD pipeline for secure credential management
- Input validation
- XSS protection
- CORS configuration
