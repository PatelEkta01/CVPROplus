import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/navbar";

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 text-black flex flex-col">
            <Navbar />
            <div className="flex-grow flex justify-center items-center py-8 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl p-6 sm:p-10 md:p-16 border border-gray-200">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 mb-6 sm:mb-8 tracking-tight">
                        About Us
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-4 sm:mb-6 text-center">
                        Welcome to <strong className="text-gray-900">CVPRO+</strong>! Our platform helps job seekers craft professional, ATS-friendly resumes that stand out in today’s competitive job market. We know how crucial it is to pass Applicant Tracking Systems, and our advanced tools optimize your resume to ensure you shine.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-8 sm:mt-10">
                        <div className="bg-gray-200 p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Why Choose Us?</h3>
                            <ul className="list-disc list-inside text-gray-700 space-y-2 sm:space-y-3">
                                <li>ATS-Optimized Templates to ensure your resume gets noticed.</li>
                                <li>Real-time feedback and keyword suggestions tailored to job descriptions.</li>
                                <li>User-friendly interface with customizable options.</li>
                                <li>Secure cloud storage to access your resumes anytime, anywhere.</li>
                            </ul>
                        </div>

                        <div className="bg-gray-200 p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Our Mission</h3>
                            <p className="text-gray-700 leading-relaxed">
                                Our mission is to empower job seekers by providing the tools and knowledge to navigate the job application process confidently. Whether you're a recent graduate or a seasoned professional, we are here to help you present your best self.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 sm:mt-12 text-center">
                        <p className="text-base sm:text-lg text-gray-700 mb-3 sm:mb-4">
                            Ready to build a resume that gets results?
                        </p>
                        <Link to="/signup">
                            <button className="w-40 sm:w-80 h-12 sm:h-14 bg-black text-white px-4 py-2 rounded-lg shadow hover:bg-gray-800 transform hover:scale-105 transition duration-300">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
