import { useState } from 'react';
import { analyzeJobDescription, tailorResumeContent } from './GeminiService';

const UseResumeTailoring = (resumeData, setResumeData) => {
  const [showPopup, setShowPopup] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [savedJobDescription, setSavedJobDescription] = useState('');
  const [resumeHistory, setResumeHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setShowPopup(false);
    try {
      const keywords = await analyzeJobDescription(jobDescription);
      const tailoredData = await tailorResumeContent(resumeData, keywords, jobDescription);

      setResumeHistory(prev => [...prev, JSON.parse(JSON.stringify(resumeData))]);
      setSavedJobDescription(jobDescription);

      setResumeData(prev => ({
        ...prev,
        personal: { ...prev.personal, summary: tailoredData.tailoredSummary },
        skills: tailoredData.tailoredSkills?.length ? tailoredData.tailoredSkills : prev.skills,
        projects: tailoredData.tailoredProjects.length ? tailoredData.tailoredProjects : prev.projects,
        experience: tailoredData.tailoredExperience.length ? tailoredData.tailoredExperience : prev.experience,
      }));
    } catch (error) {
      alert("Error tailoring resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!savedJobDescription) return;
    setRegenerating(true);
    try {
      const keywords = await analyzeJobDescription(savedJobDescription);
      const tailoredData = await tailorResumeContent(resumeData, keywords, savedJobDescription);

      setResumeHistory(prev => [...prev, JSON.parse(JSON.stringify(resumeData))]);

      setResumeData(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          summary: tailoredData.tailoredSummary || prev.personal.summary,
        },
        skills: tailoredData.tailoredSkills?.length ? tailoredData.tailoredSkills : prev.skills,
        projects: tailoredData.tailoredProjects?.length ? tailoredData.tailoredProjects : prev.projects,
        experience: tailoredData.tailoredExperience?.length ? tailoredData.tailoredExperience : prev.experience,
      }));
    } catch (error) {
      alert("Error regenerating resume. Please try again.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleReset = () => {
    if (resumeHistory.length > 0) {
      const previous = resumeHistory[resumeHistory.length - 1];
      setResumeData(previous);
      setResumeHistory(prev => prev.slice(0, -1));
      if (resumeHistory.length === 1) {
        setSavedJobDescription('');
      }
    } else {
      alert("Already at the original resume. No further undo possible.");
    }
  };

  return {
    loading,
    regenerating,
    showPopup,
    jobDescription,
    savedJobDescription,
    resumeHistory,
    handleOpenPopup: () => setShowPopup(true),
    handleClosePopup: () => setShowPopup(false),
    handleJobDescriptionChange: setJobDescription,
    handleSubmit,
    handleRegenerate,
    handleReset
  };
};

export default UseResumeTailoring;
