import React, { useState, useRef, useEffect, useMemo } from 'react';
import EditorSection from '../components/EditorSection';
import ResumePreview from '../components/ResumePreview';
import SaveButton from '../components/SaveButton';
import ExportButton from '../components/ExportButton';
import JobTailoredResume from '../components/JobTailoredResume';
import Navbar from '../components/navbar';
import Footer from '../components/footer';

const ResumeBuilder = () => {
    const [selectedTemplate, setSelectedTemplate] = useState(localStorage.getItem("selectedTemplate") || "freshie");

    const defaultResumeData = useMemo(() => ({
        personal: { name: '', email: '', phone: '', address: '', linkedin: '', summary: '' },
        skills: [],
        experience: selectedTemplate === "experienced" ? [{ jobTitle: '', company: '', startDate: '', endDate: '', tasks: [''] }] : [],
        education: [{ institution: '', graduationDate: '', course: '', location: '' }],
        projects: [],
    }), [selectedTemplate]);

    const [resumeData, setResumeData] = useState(() => {
        try {
            const storedData = localStorage.getItem("resumeData");
            console.log('Data from local storage', storedData)
            const parsed = storedData ? JSON.parse(storedData) : null;
            return parsed && typeof parsed === "object" && parsed.personal
    ? parsed
    : defaultResumeData;
        } catch (error) {
            console.error("❌ Error parsing resumeData:", error);
            return defaultResumeData;
        }
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [showError, setShowError] = useState(false);
    const previewRef = useRef();

    useEffect(() => {
        if (resumeData && Object.keys(resumeData).length > 0) {
            console.log('UseEffect', resumeData)
            localStorage.setItem("resumeData", JSON.stringify(resumeData));
        }
    }, [resumeData]);

    useEffect(() => {
        setResumeData(prev => {
            if (selectedTemplate === "experienced") {
                return {
                    ...prev,
                    experience: prev.experience.length ? prev.experience : [{ jobTitle: '', company: '', startDate: '', endDate: '', tasks: [''] }],
                };
            } else {
                const { experience, ...freshData } = prev;
                return freshData;
            }
        });
    }, [selectedTemplate]);

    const updateSection = (section, data) => {
        setResumeData(prev => ({ ...prev, [section]: data }));
    };

    const handleValidationChange = (isValid) => {
        setIsFormValid(isValid);
        setShowError(!isValid);
    };

    const handleSave = () => {
        if (isFormValid) {
            localStorage.setItem('resumeData', JSON.stringify(resumeData));
            alert('Resume data saved successfully!');
        } else {
            setShowError(true);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-grow p-4">
                <div className="flex-1 p-4 bg-white shadow-md rounded-lg mr-4">
                    <EditorSection
                        data={resumeData}
                        updateSection={updateSection}
                        onValidationChange={handleValidationChange}
                    />
                    {showError && (
                        <p className="text-red-600 font-semibold mt-2">
                            Please fix all validation errors before exporting or saving.
                        </p>
                    )}
                    <div className="save-button-wrapper">
                        <SaveButton handleSave={handleSave} isFormValid={isFormValid} />
                    </div>
                    <div className="button-controls">
                        <ExportButton
                            targetRef={previewRef}
                            isFormValid={isFormValid}
                            data={resumeData} // 👈 this is the fix
                            selectedTemplate={selectedTemplate}
                            fileName={resumeTitle}
                        />
                    </div>
                </div>
                <div className="flex-1 p-4 bg-white shadow-md rounded-lg">
                    <ResumePreview ref={previewRef} data={resumeData} />
                </div>

                {/* JobTailoredResume popup button clearly placed here */}
                <JobTailoredResume 
                    resumeData={resumeData} 
                    setResumeData={setResumeData} 
                />
            </div>
            <Footer />
        </div>
    );
};

export default ResumeBuilder;
