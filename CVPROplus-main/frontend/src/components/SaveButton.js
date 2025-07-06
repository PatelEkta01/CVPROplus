import React from 'react';
import '../CSS/ResumeBuilder.css'; 

const SaveButton = ({ handleSave, isFormValid }) => {
  return (
    <button 
  onClick={handleSave} 
  className={`w-full p-3 bg-gray-700 text-white font-semibold rounded-lg 
    hover:bg-gray-900 transition-transform transform hover:scale-105 
    focus:outline-none focus:ring-4 focus:ring-gray-500 
    ${isFormValid ? '' : 'cursor-not-allowed bg-gray-500'}`}
  disabled={!isFormValid}
>
  Save
</button>
  );
};

export default SaveButton;
