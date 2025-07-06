import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const UserResumes = () => {
  const { userId } = useParams();  // Get userId from the URL parameter
  const [resumes, setResumes] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get('username');  // Get the 'username' parameter from the URL

  useEffect(() => {
    fetchResumes(userId);
  }, [userId]);

  const fetchResumes = async (userId) => {
    try {
      const response = await axios.get(`http://loacalhost/admins/resumes/`);
      const filteredResumes = response.data.resumes.filter(resume => resume.user_id === userId); // Filter resumes by userId
      setResumes(filteredResumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  return (
    <div className="p-6 bg-gray-800 text-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6">Resumes for {username}</h1>

      <div className="overflow-x-auto bg-gray-700 shadow-lg rounded-lg">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-600">
              <th className="px-4 py-2 text-left text-sm font-medium text-white">Title</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-white">Personal Info</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-white">Skills</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-white">Projects</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-white">Experience</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-white">Education</th>
            </tr>
          </thead>
          <tbody>
            {resumes.length > 0 ? (
              resumes.map((resume) => (
                <tr key={resume.id} className="border-t border-gray-600">
                  <td className="px-4 py-2">{resume.title || 'Untitled'}</td>
                  <td className="px-4 py-2">
                    {resume.personal_info.name && <p>Name: {resume.personal_info.name}</p>}
                    {resume.personal_info.email && <p>Email: {resume.personal_info.email}</p>}
                    {resume.personal_info.phone && <p>Phone: {resume.personal_info.phone}</p>}
                    {resume.personal_info.address && <p>Address: {resume.personal_info.address}</p>}
                  </td>
                  <td className="px-4 py-2">
                    {resume.skills.length > 0 ? resume.skills.join(', ') : 'No skills listed'}
                  </td>
                  <td className="px-4 py-2">
                    {resume.projects.length > 0 ? resume.projects.map(project => (
                      <div key={project.name}>
                        <p>Project: {project.name}</p>
                        <p>Tasks: {project.tasks.join(', ')}</p>
                      </div>
                    )) : 'No projects listed'}
                  </td>
                  <td className="px-4 py-2">
                    {resume.experience.length > 0 ? resume.experience.map((exp, index) => (
                      <div key={index}>
                        <p><strong>Company:</strong> {exp.company}</p>
                        <p><strong>Role:</strong> {exp.role}</p>
                        <p><strong>Duration:</strong> {exp.duration}</p>
                        <p><strong>Description:</strong> {exp.description}</p>
                      </div>
                    )) : 'No experience listed'}
                  </td>
                  <td className="px-4 py-2">
                    {resume.education.length > 0 ? resume.education.map((edu, index) => (
                      <div key={index}>
                        <p><strong>Institution:</strong> {edu.institution}</p>
                        <p><strong>Course:</strong> {edu.course}</p>
                        <p><strong>Graduation Date:</strong> {edu.graduationDate}</p>
                      </div>
                    )) : 'No education listed'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-2 text-center">No resumes available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserResumes;
