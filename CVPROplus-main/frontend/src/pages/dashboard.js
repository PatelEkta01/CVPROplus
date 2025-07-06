import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const Dashboard = () => {
  const [userResumes, setUserResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const navigate = useNavigate();
  localStorage.removeItem("selectedTemplate");

  const fetchResumes = async (userId) => {
    try {
      const response = await axios.get("http://loacalhost/resume/retrieve/", {
        params: { user_id: userId },
      });
      console.log("API Response:", response.data);
      setUserResumes(response.data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      setError("Failed to load resumes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateTitle = async (resumeId, title) => {
    try {
      const formData = new FormData();
      console.log("Title to be updated is ", title);
      formData.append("title", title); // Corrected syntax

      const response = await axios.put(
        `http://loacalhost/resume/update/${resumeId}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setUserResumes((prevResumes) =>
          prevResumes.map((resume) =>
            resume._id === resumeId ? { ...resume, title } : resume
          )
        );
        setEditingTitle(null);
        console.log("Title updated successfully:", title);
      } else {
        console.error("Failed to update title:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating title:", error);
    }
  };

  const deleteResume = async (resumeId) => {
    try {
      const response = await axios.delete(
        `http://loacalhost/resume/delete/${resumeId}/`
      );

      if (response.status === 200) {
        setUserResumes((prevResumes) =>
          prevResumes.filter((resume) => resume._id !== resumeId)
        );
        console.log("Resume deleted successfully");
      } else {
        console.error("Failed to delete resume:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedToken = localStorage.getItem("access_token");

    if (!storedToken || !storedUser?._id) {
      navigate("/login");
      return;
    }

    setUser(storedUser);

    if (userResumes.length === 0) {
      fetchResumes(storedUser._id);
    }
  }, [userResumes.length]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-light text-gray-300 tracking-wide">
            Hi, {user?.first_name || "User"} 👋
          </h2>
          <h2 className="text-6xl font-extrabold text-white mt-3 tracking-wide">
            Your Dashboard
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center mt-6">
            <span className="text-lg text-gray-300">Loading your resumes...</span>
          </div>
        ) : error ? (
          <div className="text-center mt-6">
            <p className="text-xl text-red-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              onClick={() => navigate("/createresume")}
              className="cursor-pointer bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-700 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-opacity-90 p-6 text-center flex flex-col justify-center items-center"
            >
              <div className="relative w-48 h-60 mx-auto mb-4 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                  +
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 tracking-wide">
                Create Resume
              </h3>
            </div>

            {userResumes.length > 0 &&
              userResumes.map((resume) => {
                const imageSrc = resume.image_id
                  ? `http://loacalhost/resume/image/${resume.image_id}`
                  : "https://via.placeholder.com/250";

                return (
                  <div
                    key={resume._id}
                    className="bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-700 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:bg-opacity-90 p-6 text-center"
                  >
                    <div className="relative w-48 h-60 mx-auto mb-4">
                      <img
                        src={imageSrc}
                        alt={resume.title || "Resume Thumbnail"}
                        className="w-full h-full object-cover object-top rounded-lg shadow-md border border-gray-600"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/250";
                        }}
                      />
                    </div>

                    <div className="text-center">
                      {editingTitle === resume._id ? (
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onBlur={() => updateTitle(resume._id, newTitle)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && updateTitle(resume._id, newTitle)
                          }
                          className="bg-gray-700 text-white p-2 rounded-md w-full"
                          autoFocus
                        />
                      ) : (
                        <h3
                          className="text-lg font-semibold text-gray-200 cursor-pointer"
                          onClick={() => {
                            setEditingTitle(resume._id);
                            setNewTitle(resume.title || "");
                          }}
                        >
                          {resume.title || "Untitled Resume"}
                        </h3>
                      )}
                      <div className="mt-4 flex justify-center space-x-4">
                        <button
                          onClick={() => {
                            setSelectedResume(imageSrc);
                            setIsImageLoading(true);
                          }}
                          className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-500 transition-all duration-200"
                        >
                          View Resume
                        </button>
                        <button
                          onClick={() => navigate(`/template-selection/${resume._id}`)}
                          className="px-5 py-2 bg-yellow-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-500 transition-all duration-200"
                        >
                          Edit
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => deleteResume(resume._id)}
                          className="px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-500 transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <Footer />

      {selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-11/12 max-w-4xl max-h-[90vh] overflow-auto relative">
            <button
              onClick={() => {
                setSelectedResume(null);
                setIsImageLoading(true);
              }}
              className="absolute top-4 right-4 bg-gray-700 text-white px-3 py-2 rounded-full hover:bg-gray-600"
            >
              ❌
            </button>

            {isImageLoading && (
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}

            <img
              src={selectedResume}
              alt="Resume Preview"
              className={`w-full h-auto rounded-lg shadow transition-opacity duration-500 ${
                isImageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setIsImageLoading(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
