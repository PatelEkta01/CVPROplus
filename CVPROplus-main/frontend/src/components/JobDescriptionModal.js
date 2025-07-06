import React from 'react';

const JobDescriptionModal = ({ jobDescription, onChange, onCancel, onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[600px]">
        <h3 className="text-xl font-semibold mb-4">Paste Job Description To Tailor the Resume</h3>
        <textarea
          className="w-full h-60 p-2 border rounded-lg resize-none"
          value={jobDescription}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={onCancel}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionModal;
