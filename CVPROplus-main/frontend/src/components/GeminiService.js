import axios from 'axios';
import { buildTailorPrompt } from './PromptBuilder';

const GEMINI_API_KEY = "AIzaSyCzqhd4EsBbaMqg9rbqJYZ0fmpKHTUUFNE";

const parseGeminiJSON = (responseText) => {
  try {
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}') + 1;
    const jsonString = responseText.substring(jsonStart, jsonEnd);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing Gemini JSON:", error, responseText);
    throw new Error("Failed to parse Gemini response.");
  }
};

export const analyzeJobDescription = async (description) => {
  const prompt = `Extract top 6 core skills with no descriptors from job description: ${description}. Return JSON {"keywords":[]}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 2048 }
      }
    );

    const responseText = response.data.candidates[0].content.parts[0].text;
    return parseGeminiJSON(responseText).keywords;
  } catch (error) {
    console.error("Gemini API Error (Analyze Job Description):", error);
    throw new Error("Failed analyzing job description.");
  }
};

export const tailorResumeContent = async (resumeData, keywords, jobDescription) => {
  const prompt = buildTailorPrompt(resumeData, keywords, jobDescription);

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
      }
    );

    const responseText = response.data.candidates[0].content.parts[0].text;
    return parseGeminiJSON(responseText);
  } catch (error) {
    console.error("Gemini API Error (Tailor Resume Content):", error);
    throw new Error("Failed tailoring resume content.");
  }
};

const ATS_RULES = `Please analyze this resume and provide feedback based on the following ATS (Applicant Tracking System) rules:

1. Contact Information (15 points):
- Must have full name, professional email, phone number
- Must have address in the format: Street Address, City, State/Province(2 letters)
- LinkedIn profile is a plus

2. Formatting and Structure (10 points):
- Basic readability
- No major formatting issues that affect readability

3. Content Organization (30 points):
- Work experience with dates
- Education with dates
- Skills section present
- Achievements quantified with metrics
- Clear chronological or functional structure

4. Keywords and Language (25 points):
- Industry-specific keywords present
- Action verbs at the start of bullets
- Technical skills relevant to job market
- No jargon or abbreviations
- Proper grammar and spelling

5. Professional Impact (20 points):
- Achievements clearly stated
- Impact metrics (percentages, numbers)
- Leadership or initiative examples
- Project outcomes
- Awards or recognitions

Analyze the resume and provide:
1. A score out of 100
2. A list of strengths (what rules were followed well)
3. A list of improvements needed (what rules were violated)
4. Brief explanation for each point

Format your response as a JSON object with the following structure:
{
    "score": number,
    "strengths": [
        {"rule": "string", "explanation": "string"}
    ],
    "improvements": [
        {"rule": "string", "explanation": "string"}
    ]
}`;

const formatFeedback = (result) => {
  const formattedFeedback = [];
  
  // Add strengths with checkmarks
  if (result.strengths && Array.isArray(result.strengths)) {
    for (const strength of result.strengths) {
      if (typeof strength === 'object' && strength.rule && strength.explanation) {
        formattedFeedback.push(`✓ ${strength.rule}: ${strength.explanation}`);
      } else if (typeof strength === 'string') {
        formattedFeedback.push(`✓ ${strength}`);
      }
    }
  }
  
  // Add improvements with X marks
  if (result.improvements && Array.isArray(result.improvements)) {
    for (const improvement of result.improvements) {
      if (typeof improvement === 'object' && improvement.rule && improvement.explanation) {
        formattedFeedback.push(`✗ ${improvement.rule}: ${improvement.explanation}`);
      } else if (typeof improvement === 'string') {
        formattedFeedback.push(`✗ ${improvement}`);
      }
    }
  }

  return {
    score: result.score || 0,
    feedback: formattedFeedback
  };
};

export const analyzeResume = async (resumeText) => {
  const prompt = `
  Here is the resume content to analyze:

  ${resumeText}

  ${ATS_RULES}
  `;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192
        }
      }
    );

    const responseText = response.data.candidates[0].content.parts[0].text;
    const result = parseGeminiJSON(responseText);
    return formatFeedback(result);
  } catch (error) {
    console.error("Gemini API Error (Analyze Resume):", error);
    throw new Error("Failed analyzing resume. Please try again.");
  }
};

export const analyzeResumeFromPDF = async (base64Data) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: ATS_RULES
          }, {
            inline_data: {
              mime_type: "application/pdf",
              data: base64Data
            }
          }]
        }]
      }
    );

    if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
      throw new Error("Invalid response from API");
    }

    const responseText = response.data.candidates[0].content.parts[0].text;
    const result = parseGeminiJSON(responseText);
    return formatFeedback(result);
  } catch (error) {
    console.error("Gemini API Error (Analyze Resume from PDF):", error);
    throw new Error("Failed analyzing resume. Please try again.");
  }
};
