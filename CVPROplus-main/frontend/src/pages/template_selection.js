import React, { useState, useRef ,useEffect} from 'react';
import EditorSection from '../components/EditorSection';
import SaveButton from '../components/SaveButton';
import ExportButton from '../components/ExportButton'; // ✅ Import ExportButton
import JobTailoredResume from '../components/JobTailoredResume';
import '../CSS/template-resume.css';
import html2canvas from "html2canvas";
import { useParams } from "react-router-dom";
import Navbar from '../components/navbar';
import { BASE_URL } from "../Constant";
import Footer from '../components/footer';
import axios from "axios";
// Import both resume templates
import ResumePreview from '../components/ResumePreview';
import ProfessionalResumePreview from '../components/ProfessionalResumePreview';

function TemplateSelection() {
  const { resumeId } = useParams();
  useEffect(() => {
    console.log('ResumeId', resumeId);
    fetchResumeDetails(resumeId);
}, [resumeId]);

  const [resumeData, setResumeData] = useState({
    personal: {
      name: '',
      email: '',
      linkedin: '',
      phone: '',
      address: '',
      summary: '',
    },
    skills: [],
    experience: [],
    education: [
      {
        institution: '',
        graduationDate: '',
        course: '',
        location: '',
      },
    ],
    projects: [],
    selectedTemplate: localStorage.getItem("selectedTemplate") || '', // Set from localStorage initially
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const previewRef = useRef();

  const [resumeTitle, setResumeTitle] = useState("resume"); // Default title


  const fetchResumeDetails = async (resumeId) => {
    try {
        let response = {};
        if (resumeId) {
            response = await axios.get(`http://loacalhost/resume/retrieve/?id=${resumeId}`);
        } else {
            response = {
                data: { resume_details: JSON.parse(localStorage.getItem("resumeData")) || null }
            };
        }

        console.log(response.data);

        const fetchedData = response.data.resume_details; // Extract resume details
        console.log("Printing fetched data as", fetchedData);

        if (!fetchedData) {
            console.error("No resume details found.");
            return;
        }

        // Set title if available
        if (response.data.title) {
            setResumeTitle(response.data.title);
        }

        // Set selectedTemplate from local storage or fetched data
        const storedTemplate = localStorage.getItem("selectedTemplate");
        const fetchedTemplate = fetchedData.selectedTemplate || "";

        setResumeData((prevData) => ({
            ...prevData,
            selectedTemplate: storedTemplate || fetchedTemplate || "default", // Fallback to 'default' if nothing is found
        }));

        // Update each section separately
        if (fetchedData.personal) {
            updateSection("personal", {
                name: fetchedData.personal.name || "",
                email: fetchedData.personal.email || "",
                phone: fetchedData.personal.phone || "",
                address: fetchedData.personal.address || "",
                summary: fetchedData.personal.summary || "",
            });
        }

        if (Array.isArray(fetchedData.skills)) {
            updateSection("skills", fetchedData.skills.length > 0 ? fetchedData.skills : []);
        }

        if (Array.isArray(fetchedData.experience)) {
            updateSection("experience", fetchedData.experience.length > 0 ? fetchedData.experience : []);
        }

        if (Array.isArray(fetchedData.education)) {
            updateSection("education", fetchedData.education.length > 0 ? fetchedData.education : []);
        }

        if (Array.isArray(fetchedData.projects)) {
            updateSection("projects", fetchedData.projects.length > 0 ? fetchedData.projects : []);
        }

    } catch (error) {
        console.error("Error fetching resume details:", error);
    }
};

// Use selectedTemplate from state
const selectedTemplate = resumeData.selectedTemplate;
const SelectedResumePreview = selectedTemplate === "experienced" ? ProfessionalResumePreview : ResumePreview;

console.log("Selected Template:", selectedTemplate);

  const updateSection = (section, data, index = null) => {
    if (index !== null) {
      setResumeData((prev) => {
        const updatedSection = [...prev[section]];
        updatedSection[index] = data;
        return { ...prev, [section]: updatedSection };
      });
    } else {
      setResumeData((prev) => ({ ...prev, [section]: data }));
    }
  };

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;

    if (!userId) {
        alert("User ID not found. Please log in again.");
        return;
    }

    console.log(resumeData);

    // Capture resume preview as image
    const resumeElement = previewRef.current;
    const fullCanvas = await html2canvas(resumeElement);

    // Create a thumbnail
    const thumbnailCanvas = document.createElement("canvas");
    const ctx = thumbnailCanvas.getContext("2d");
    thumbnailCanvas.width = 150;
    thumbnailCanvas.height = 200;
    ctx.drawImage(fullCanvas, 0, 0, 150, 300);

    // Convert images to Blob format
    const fullImageBlob = await new Promise((resolve) => fullCanvas.toBlob(resolve, "image/png"));
    const thumbnailBlob = await new Promise((resolve) => thumbnailCanvas.toBlob(resolve, "image/png"));

    const formData = new FormData();
    formData.append("image", fullImageBlob, "resume.png");
    formData.append("resumeData", JSON.stringify(resumeData)); 
    formData.append("user_id", userId);

    try {
        let response;

        if (resumeId) {
            // If resume already exists, update it
            //formData.append("resume_id", resumeId);
            response = await fetch(`http://loacalhost/resume/update/${resumeId}/`, {
                method: "PUT",
                body: formData,
            });
        } else {
            // If no resumeId, create a new one
            response = await fetch("http://loacalhost/resume/create/", {
                method: "POST",
                body: formData,
            });
        }

        if (response.ok) {
            const result = await response.json();
            console.log("Resume saved/updated:", result);
            alert(resumeId ? "Resume updated successfully!" : "Resume saved successfully!");

            // If a new resume is created, update resumeId
            if (!resumeId && result.resume_id) {
                window.history.replaceState(null, "", `/template/${result.resume_id}`);
            }
        } else {
            console.error("Failed to save/update resume");
            alert("Error saving/updating resume");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Network error, please try again");
    }
  };

  return (
    <div className='Navbar'>
      <Navbar />
      <div className="app-container">
      <div className="editor-section">
          {/* Pass setIsFormValid to EditorSection */}
          <EditorSection 
            data={resumeData} 
            updateSection={updateSection} 
            onValidationChange={setIsFormValid} 
          />

          {/* Flex container for buttons */}
          <div className="flex items-center justify-start gap-4 mt-4">
              <SaveButton 
                handleSave={handleSave} 
                isFormValid={isFormValid} 
                className="flex-shrink-0" 
              />
              <ExportButton
                targetRef={previewRef}
                isFormValid={isFormValid}
                data={resumeData}            
                fileName={resumeTitle}
                selectedTemplate={selectedTemplate}
                className="flex-shrink-0"
              />
            </div>
        </div>
        {/* Dynamically render the selected resume template with a key */}
        <SelectedResumePreview 
          key={selectedTemplate} // Add key here to force re-render
          ref={previewRef} 
          data={resumeData} 
        />

        {/* JobTailoredResume component */}
        <JobTailoredResume 
        resumeData={resumeData} 
        setResumeData={setResumeData} 
      />
      </div>
      <div className='Footer'>

        <Footer />
      </div>
    </div>
  );
}

export default TemplateSelection;
