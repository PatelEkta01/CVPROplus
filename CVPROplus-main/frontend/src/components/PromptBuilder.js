export const buildTailorPrompt = (data, keywords, jobDescForPrompt) => {
    const selectedTemplate = localStorage.getItem("selectedTemplate") || "freshie";
    const hasUserSummary = data?.personal?.summary?.trim();
    const hasExperience = Array.isArray(data.experience) && data.experience.length > 0;
  
    return `
  You are a professional resume assistant.
  
  A user is tailoring their resume based on the following job description:
  """
  ${jobDescForPrompt}
  """
  
  The following keywords were extracted from the job description and are relevant for tailoring:
  ${keywords.join(', ')}
  
  Use these keywords when rephrasing tasks wherever appropriate.
  
  Their current resume data is:
  ${JSON.stringify(data)}
  
  The selected template is: "${selectedTemplate}". 

${
  selectedTemplate === "freshie" || !hasExperience
    ? `This means the user is a fresher or recent graduate. ❗ You must NOT write the summary or projects as if the user has professional work experience. Do not mention any roles or experience unless it clearly exists in their resume. Focus only on academic achievements, coursework, and technical projects.`
    : `This indicates the user has professional experience. Highlight relevant work history and accomplishments accordingly.`
}
  
  Important rules:
  - Do not assume the user's field of study or major. Only use what is explicitly mentioned in the resume's education section.
  - Never refer to the user as a Computer Science student unless the term "Computer Science" explicitly appears in their education field.
  - Avoid making assumptions about background or coursework. Only reference what is present in the resume data.
  - Do not mention the user's field of study, degree name, or that they are a student in the summary. Focus solely on technical skills, experience, and project contributions.
  
  ${
      hasUserSummary
        ? `The user has provided a personal summary. Rephrase it into a concise, ATS-optimized 2–3 sentence version aligned with the job description and resume content. Use technical language, measurable outcomes, and avoid vague or filler phrases like “aspiring,” “eager to contribute,” or “motivated individual.” The revised version should highlight skills, experience, and alignment with industry terms from the job description.`
        : `Write a concise, ATS-optimized 2–3 sentence summary tailored to the job description. 
            Use industry-relevant keywords from the job description and the resume, focusing on technical skills, programming languages, and development experience. 
            Avoid vague or generic phrases like “eager to contribute” or “aspiring.”  
            Do not reference the user's degree or field of study. 
            Describe experience using measurable, action-oriented terms (e.g., full-stack development, REST APIs, Git, scalable solutions, agile practices). 
            Make the summary confident, concise, and aligned with the target job.`
    }
  
  Your task includes the following:
  - Rephrase the user's summary (if it exists) in a professional tone that aligns with the job description while preserving original intent.
  - Go through each project and its tasks. For every task description, enhance the language by integrating 1–2 relevant keywords from the job description, while keeping the original task intent and meaning unchanged.
  - You must update every task description unless it already contains job-related terminology. Do not skip or repeat tasks. Ensure that the final descriptions sound more aligned with professional job descriptions.
  - Use professional, clear, and concise language that mirrors how similar tasks are described in job postings.
  - Do not remove or invent any tasks — only enhance what's already there.
  - Make sure to use industry-relevant keywords and phrasing that improves alignment with the job description.
  - Do the same for the experience section — revise task bullets to incorporate job-related keywords without changing the original purpose.
  - Do NOT repeat the exact same wording from the job description.
  - Do NOT add new projects or experience entries — only enhance what's already there.
  - If the user has no experience field or it's an empty array, you MUST NOT invent or mention any professional experience.
  
  Avoid generic phrases like “eager to contribute,” “seeking a role,” or “motivated individual.” Focus instead on value and relevance to the job description.
  
  Failure to update the task descriptions with job-aligned language will be considered an incomplete response.
  
  Respond in strictly this JSON format:
  {
    "tailoredSummary": "your_updated_summary_here",
    "tailoredSkills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5", "Skill6"],
    "tailoredProjects": ${JSON.stringify(data.projects)},
    "tailoredExperience": ${JSON.stringify(data.experience)}
  }
  
  Return 6 job-relevant skill names (just the skill name, no descriptors) based on alignment between the user's resume content and the job description.  
  Always evaluate based on the user's technical capabilities and adapt the skill list to emphasize what's most relevant to the job description — even if alignment is partial.
  Do not reuse the same skills unless they are clearly relevant to this specific job.
  
  You must compare the user's existing project descriptions and experience against the job responsibilities.  
  If there's clear alignment, generate tailored skills. Otherwise, return an empty list to indicate no change needed.
  `;
  };
  