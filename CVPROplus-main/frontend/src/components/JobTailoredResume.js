import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { TbReload } from 'react-icons/tb';
import UseResumeTailoring from './UseResumeTailoring';
import JobDescriptionModal from './JobDescriptionModal'

const JobTailoredResume = ({ resumeData, setResumeData }) => {
  const {
    loading,
    regenerating,
    showPopup,
    jobDescription,
    savedJobDescription,
    resumeHistory,
    handleOpenPopup,
    handleClosePopup,
    handleJobDescriptionChange,
    handleSubmit,
    handleRegenerate,
    handleReset
  } = UseResumeTailoring(resumeData, setResumeData);

  return (
    <>
      <div className="fixed bottom-6 right-6 flex items-center gap-3">
        <button
          onClick={handleReset}
          disabled={resumeHistory.length === 0}
          className={`p-4 rounded-full shadow-lg text-white ${
            resumeHistory.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
          title="Undo Last Tailoring"
        >
          Reset
        </button>

        <button
          onClick={handleOpenPopup}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
          title="Tailor Resume"
        >
          <FaPlus size={24} />
        </button>
      </div>

      <button
        onClick={handleRegenerate}
        disabled={!savedJobDescription}
        className={`fixed bottom-24 right-6 p-4 rounded-full shadow-lg ${
          savedJobDescription ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
        } text-white`}
        title="Regenerate Resume"
      >
        <TbReload size={24} />
      </button>

      {showPopup && (
        <JobDescriptionModal
          jobDescription={jobDescription}
          onChange={handleJobDescriptionChange}
          onCancel={handleClosePopup}
          onSubmit={handleSubmit}
        />
      )}

      {(loading || regenerating) && (
        <p className="fixed bottom-36 right-6 bg-white shadow-lg px-4 py-2 rounded">
          {loading ? "Tailoring resume..." : "Regenerating resume..."}
        </p>
      )}
    </>
  );
};

export default JobTailoredResume;
