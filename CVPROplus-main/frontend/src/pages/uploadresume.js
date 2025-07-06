import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiEdit, FiArrowDown } from "react-icons/fi";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import temp1 from "../assets/temp1.png";
import temp2 from "../assets/temp2.png";

const ResumeUpload = () => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isUploading, setIsUploading] = useState(false);  // Uploading state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const accessToken = localStorage.getItem("access_token");

        if (!accessToken) {
            navigate("/login");
        }
    }, [navigate]);

    const validateFile = (selectedFile) => {
        if (selectedFile) {
            const fileType = selectedFile.name.split(".").pop().toLowerCase();
            if (["pdf", "doc", "docx"].includes(fileType)) {
                setFile(selectedFile);
                setError("");
                return true;
            } else {
                setError("Only PDF or Word files are allowed.");
                setFile(null);
                return false;
            }
        }
        return false;
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        validateFile(selectedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateFile(droppedFile);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a valid resume file.");
            return;
        }

        setIsUploading(true);  // Start loading animation
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://loacalhost/resume/extract/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("Upload Success:", response.data);
            alert("Resume uploaded successfully!");
            localStorage.setItem("resumeData", JSON.stringify(response.data));
            setIsModalOpen(true);
            setSuccess("Resume uploaded successfully!");
            setError("");
        } catch (error) {
            if (error.response) {
                console.error("Error Response:", error.response.data);
                setError(error.response.data.message || "Failed to upload resume.");
            } else {
                console.error("Unexpected Error:", error);
                setError("An unexpected error occurred.");
            }
        } finally {
            setIsUploading(false);  // Stop loading animation
        }
    };

    const handleTemplateSelection = (template) => {
        localStorage.setItem("selectedTemplate", template);
        setSelectedTemplate(template);
        setIsModalOpen(false);
        navigate("/template_selection");
    };

    const handleCreateResume = () => {
        localStorage.removeItem("resumeData");
        setIsModalOpen(true);
    };

    const renderFilePreview = () => {
        if (!file) return null;
        
        const fileType = file.name.split(".").pop().toLowerCase();
        if (fileType === "pdf") {
            return (
                <embed
                    src={URL.createObjectURL(file)}
                    type="application/pdf"
                    width="300"
                    height="400"
                />
            );
        } else if (["jpg", "jpeg", "png"].includes(fileType)) {
            return <img src={URL.createObjectURL(file)} alt="File Preview" className="w-24 h-24 object-cover" />;
        }
        return <p className="text-sm text-gray-500">No preview available</p>;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between">
            <Navbar />

            <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
                <h2 className="text-4xl font-bold mb-6">Manage Your Resume</h2>
                <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-10">

                    {/* Upload Resume */}
                    <div className="relative group">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`w-56 h-56 flex flex-col items-center justify-center bg-gray-800 rounded-lg shadow-lg ${
                                isDragging ? 'border-2 border-dashed border-blue-500 bg-gray-700' : 'hover:bg-gray-700'
                            } transition-all transform hover:scale-105 cursor-pointer`}
                        >
                            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                <FiUpload className={`text-4xl mb-3 ${isDragging ? 'text-blue-400' : 'text-white'}`} />
                                <span className="text-xl font-semibold">Upload Resume</span>
                                <FiArrowDown className="text-3xl mt-2 animate-bounce" />
                                <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                            </label>
                        </div>
                    </div>

                    {/* Create Resume from Scratch */}
                    <div onClick={handleCreateResume} className="relative group cursor-pointer">
                        <div className="w-56 h-56 flex flex-col items-center justify-center bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-transform transform hover:scale-105">
                            <FiEdit className="text-4xl mb-3" />
                            <span className="text-xl font-semibold">Create Resume</span>
                            <FiArrowDown className="text-3xl mt-2 animate-bounce" />
                        </div>
                    </div>
                </div>

                {/* Error or Success Message */}
                {error && <p className="text-red-500 mt-4">{error}</p>}
                {success && <p className="text-green-500 mt-4">{success}</p>}

                {/* File Name and Preview */}
                {file && (
                    <div className="mt-6 w-full flex flex-col items-center">
                        <p className="text-lg font-semibold">{file.name}</p>
                        <div className="mt-2 flex justify-center items-center">
                            {renderFilePreview()}
                        </div>
                        <button
                            onClick={handleUpload}
                            className="mt-6 px-6 py-3 bg-blue-600 rounded-lg font-bold text-white hover:bg-blue-500 transition flex items-center"
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            ) : null}
                            {isUploading ? "Uploading..." : "Upload Now"}
                        </button>
                    </div>
                )}
            </div>

            {/* Modal for Template Selection */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white text-black p-6 rounded-lg w-1/2">
                        <h3 className="text-2xl font-bold mb-4">Select a Template</h3>
                        <div className="flex justify-around space-x-4">
                            <div onClick={() => handleTemplateSelection('freshie')} className="cursor-pointer">
                                <img src={temp1} alt="Freshie Template" className="w-50 h-80 rounded-lg" />
                                <p className="text-center mt-2">Freshie</p>
                            </div>
                            <div onClick={() => handleTemplateSelection('experienced')} className="cursor-pointer">
                                <img src={temp2} alt="Experienced Template" className="w-50 h-80 rounded-lg" />
                                <p className="text-center mt-2">Experienced</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ResumeUpload;
