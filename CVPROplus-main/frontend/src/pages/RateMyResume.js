import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload } from "react-icons/fi";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { analyzeResume, analyzeResumeFromPDF } from "../components/GeminiService";

// Add CSS for animations
import "../CSS/RateMyResume.css";

const RateMyResume = () => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const navigate = useNavigate();
    
    // Gemini API key - in a production app, this should be stored securely
    const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

    useEffect(() => {
        // No need to check for authentication since we're using frontend-only approach
    }, []);

    const validateFile = (file) => {
        const fileType = file.name.split(".").pop().toLowerCase();
        if (["pdf"].includes(fileType)) {
            setFile(file);
            setError("");
            setSuccess("");
            return true;
        } else {
            setError("Only PDF files are allowed.");
            setFile(null);
            return false;
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Clear previous analysis when new file is selected
            setScore(null);
            setFeedback([]);
            setError("");
            setSuccess("");
            validateFile(selectedFile);
        }
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
        if (droppedFile) {
            // Clear previous analysis when new file is dropped
            setScore(null);
            setFeedback([]);
            setError("");
            setSuccess("");
            validateFile(droppedFile);
        }
    };

    // Function to render file preview
    const renderFilePreview = () => {
        if (!file) return null;
        
        return (
            <div className="pdf-preview-container">
                <embed
                    src={URL.createObjectURL(file)}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    className="rounded-lg shadow-lg"
                />
            </div>
        );
    };
    
    // Function to extract text from PDF using pdf.js
    const extractTextFromPDF = async (pdfFile) => {
        try {
            console.log("Starting PDF text extraction...");
            // Load the PDF.js library dynamically
            const pdfjsLib = await import('pdfjs-dist/build/pdf');
            const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
            
            console.log("PDF.js libraries loaded");
            pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
            
            // Read the file as ArrayBuffer
            console.log("Converting file to ArrayBuffer...");
            const arrayBuffer = await pdfFile.arrayBuffer();
            console.log("ArrayBuffer size:", arrayBuffer.byteLength);
            
            // Load the PDF document
            console.log("Loading PDF document...");
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            console.log("PDF loaded, number of pages:", pdf.numPages);
            
            let fullText = '';
            
            // Extract text from each page
            for (let i = 1; i <= pdf.numPages; i++) {
                console.log(`Processing page ${i}...`);
                const page = await pdf.getPage(i);
                
                // Get text content
                const textContent = await page.getTextContent();
                console.log(`Page ${i} text items count:`, textContent.items.length);
                
                // Extract text from each text item
                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ')
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .trim();
                
                fullText += pageText + '\n';
                console.log(`Page ${i} text length:`, pageText.length);
            }
            
            console.log("Total extracted text length:", fullText.length);
            if (!fullText.trim()) {
                console.log("Warning: No text content was extracted from the PDF");
            }
            
            return fullText;
        } catch (error) {
            console.error('Detailed error in PDF text extraction:', error);
            throw new Error('Failed to extract text from PDF. Please try a different file.');
        }
    };

    const handleRateResume = async () => {
        if (!file) {
            setError("Please upload a resume first.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");
        setScore(null);
        setFeedback([]);
        
        try {
            let analysisResult;
            
            // Step 1: Try text extraction first
            console.log("Attempting text extraction from PDF...");
            try {
                const pdfText = await extractTextFromPDF(file);
                
                if (!pdfText || pdfText.trim() === '') {
                    throw new Error("No text content extracted");
                }
                
                // If text extraction succeeds, analyze with Gemini
                console.log("Text extraction successful, analyzing with Gemini...");
                analysisResult = await analyzeResume(pdfText);
            } catch (textExtractionError) {
                console.log("Text extraction failed, falling back to direct PDF analysis...");
                
                // Convert PDF to base64
                const reader = new FileReader();
                const base64Promise = new Promise((resolve, reject) => {
                    reader.onload = () => {
                        const base64String = reader.result.split(',')[1];
                        resolve(base64String);
                    };
                    reader.onerror = (error) => reject(error);
                });
                reader.readAsDataURL(file);

                const base64Data = await base64Promise;
                
                // Call Gemini API directly with PDF
                analysisResult = await analyzeResumeFromPDF(base64Data);
            }
            
            // Step 2: Update state with results
            setScore(analysisResult.score);
            setFeedback(analysisResult.feedback);
            setSuccess("Resume analysis completed successfully!");
            
            // Scroll to results
            const resultsElement = document.getElementById('resume-results');
            if (resultsElement) {
                resultsElement.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            console.error("Error rating resume:", error);
            setError(error.message || "Failed to rate resume. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Navbar />

            <div className="flex-grow container mx-auto px-6 py-8">
                <div className="text-center mb-10">
                    <h2 className="text-6xl font-extrabold tracking-wide mb-4">
                        Rate My Resume
                    </h2>
                    <p className="text-xl text-gray-400">
                        Upload your resume and get instant AI feedback on its effectiveness
                    </p>
                </div>

                {/* Upload Section - Only show if no file is uploaded */}
                {!file && (
                    <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed ${
                                isDragging ? 'border-blue-500 bg-gray-700' : 'border-gray-600'
                            } rounded-lg hover:border-gray-500 transition-colors`}
                        >
                            <FiUpload className={`text-4xl mb-4 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`} />
                            <label className="cursor-pointer">
                                <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors">
                                    Choose PDF File
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".pdf"
                                />
                            </label>
                            <p className="mt-2 text-sm text-gray-400">
                                Drag & drop your PDF file here or click to browse
                            </p>
                        </div>
                    </div>
                )}

                {/* Error or Success Messages */}
                {error && (
                    <div className="max-w-4xl mx-auto bg-red-900/30 border border-red-500 rounded-xl p-4 mb-6">
                        <p className="text-red-400 text-center">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="max-w-4xl mx-auto bg-green-900/30 border border-green-500 rounded-xl p-4 mb-6">
                        <p className="text-green-400 text-center">{success}</p>
                    </div>
                )}

                {/* Preview and Rate Section */}
                {file && (
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                            <h3 className="text-xl font-semibold mb-4">
                                {file.name}
                            </h3>
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Left side: PDF Preview */}
                                <div className="flex-1">
                                    <div className="pdf-preview-wrapper">
                                        {renderFilePreview()}
                                    </div>
                                    <div className="flex justify-center space-x-4 mt-8">
                                        <button
                                            onClick={handleRateResume}
                                            disabled={loading}
                                            className={`${
                                                loading ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-500'
                                            } text-white px-8 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105 duration-200 flex items-center`}
                                        >
                                            {loading && (
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {loading ? "Analyzing with AI..." : "Rate My Resume"}
                                        </button>

                                        <label className="cursor-pointer">
                                            <span className="inline-block bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-500 transition-colors transform hover:scale-105 duration-200">
                                                Change File
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={handleFileChange}
                                                accept=".pdf"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Right side: Analysis Results */}
                                {score !== null && (
                                    <div className="flex-1">
                                        <div id="resume-results" className="bg-gray-700 rounded-lg p-6 animate-fadeIn pdf-preview-match-height">
                                            <div className="text-center mb-6">
                                                <h3 className="text-2xl font-bold mb-2">Resume Score</h3>
                                                <div className={`text-5xl font-bold ${
                                                    score >= 80 ? 'text-green-400' : 
                                                    score >= 60 ? 'text-yellow-400' : 
                                                    'text-red-400'
                                                }`}>{score}/100</div>
                                                <p className="mt-2 text-gray-400">
                                                    {score >= 80 ? 'Excellent! Your resume is ATS-friendly.' : 
                                                     score >= 60 ? 'Good, but there\'s room for improvement.' : 
                                                     'Your resume needs significant improvements to pass ATS systems.'}
                                                </p>
                                            </div>
                                            
                                            <div className="space-y-4 feedback-content">
                                                <h4 className="text-xl font-semibold">Detailed Feedback:</h4>
                                                <div className="space-y-4">
                                                    <div className="bg-gray-800 p-4 rounded-lg">
                                                        <h5 className="text-lg font-semibold text-green-400 mb-2">Strengths</h5>
                                                        <ul className="space-y-2">
                                                            {feedback.filter(item => item.startsWith('✓')).map((item, index) => (
                                                                <li 
                                                                    key={`strength-${index}`}
                                                                    className="text-green-400 flex"
                                                                >
                                                                    <span className="mr-2">✓</span>
                                                                    <span>{item.substring(2)}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="bg-gray-800 p-4 rounded-lg">
                                                        <h5 className="text-lg font-semibold text-red-400 mb-2">Areas to Improve</h5>
                                                        <ul className="space-y-2">
                                                            {feedback.filter(item => item.startsWith('✗')).map((item, index) => (
                                                                <li 
                                                                    key={`improvement-${index}`}
                                                                    className="text-red-400 flex"
                                                                >
                                                                    <span className="mr-2">✗</span>
                                                                    <span>{item.substring(2)}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default RateMyResume; 