import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/footer';

const ViewResume = () => {
    const { id } = useParams();
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const response = await fetch(`/api/resumes/${id}`);
                if (!response.ok) {
                    throw new Error('Resume not found');
                }
                const data = await response.json();
                setResume(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchResume();
    }, [id]);

    if (loading) return <div className="text-center text-white">Loading...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Navbar />
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold text-primary mb-6">{resume.personal.name}'s Resume</h1>
                
                <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold text-primary">Personal Details</h2>
                    <p><strong>Email:</strong> {resume.personal.email}</p>
                    <p><strong>Phone:</strong> {resume.personal.phone}</p>
                    <p><strong>Address:</strong> {resume.personal.address}</p>
                </section>

                <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold text-primary">Skills</h2>
                    <ul className="list-disc pl-6">
                        {resume.skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                        ))}
                    </ul>
                </section>

                <section className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold text-primary">Education</h2>
                    {resume.education.map((edu, index) => (
                        <div key={index} className="mb-4">
                            <p><strong>{edu.institution}</strong> - {edu.course}</p>
                            <p>{edu.graduationDate} | {edu.location}</p>
                        </div>
                    ))}
                </section>

                {resume.experience && resume.experience.length > 0 && (
                    <section className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-primary">Work Experience</h2>
                        {resume.experience.map((exp, index) => (
                            <div key={index} className="mb-4">
                                <p><strong>{exp.jobTitle}</strong> at {exp.company}</p>
                                <p>{exp.startDate} - {exp.endDate} | {exp.location}</p>
                            </div>
                        ))}
                    </section>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ViewResume;
