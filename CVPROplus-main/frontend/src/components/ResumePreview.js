import React, { useEffect, useRef, useState, forwardRef } from 'react';
import '../CSS/ResumePreview.css';

const ResumePreview = forwardRef(({ data }, ref) => {
  const fullContentRef = useRef(null);
  const [pages, setPages] = useState([]);

  const A4_HEIGHT_PX = 1122;
  const A4_WIDTH_PX = 794; 

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    setTimeout(() => {
      if (!fullContentRef.current) return;
      
      // Grab all direct children — each is a "block" to measure
      const contentBlocks = Array.from(fullContentRef.current.children);

      let currentPage = [];
      let pagesArray = [];
      let pageHeight = 0;

      contentBlocks.forEach((node) => {
        const nodeHeight = node.offsetHeight;

        // If adding this block exceeds A4 height, start a new page
        if (pageHeight + nodeHeight > A4_HEIGHT_PX) {
          pagesArray.push(currentPage);
          currentPage = [node.outerHTML];
          pageHeight = nodeHeight;
        } else {
          currentPage.push(node.outerHTML);
          pageHeight += nodeHeight;
        }
      });

      if (currentPage.length) {
        pagesArray.push(currentPage);
      }

      setPages(pagesArray);
    }, 100);
  }, [data]);

  /**
   * Breaks the resume data into multiple small "blocks" (React elements),
   * ensuring each item is a direct sibling in the DOM. This allows
   * your pagination logic to split them naturally.
   */
  const renderResumeContent = () => {
    if (!data || Object.keys(data).length === 0) return [];

    const blocks = [];

    // Header
    blocks.push(
      <div key="header" className="resume-header">
        <h1>{data?.personal?.name || 'Your Name'}</h1>
        <p>
          <a href={`mailto:${data?.personal?.email}`} className="contact-link">
            {data?.personal?.email || 'your.email@example.com'}
          </a>{' '}
          | {data?.personal?.phone || '000-000-0000'} |{' '}
          {data?.personal?.address || 'Your Address'}
        </p>
        {data?.personal?.linkedin && (
          <p>
            <a
              href={data.personal.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              {data.personal.linkedin}
            </a>
          </p>
        )}
      </div>
    );

    // Summary
    if (data?.personal?.summary) {
      blocks.push(
        <div key="summary-section" className="resume-section">
          <div className="section-lines">
            <span className="section-title">Summary</span>
          </div>
        </div>
      );
      blocks.push(
        <div key="summary-content" className="section-content">
          <p>{data.personal.summary}</p>
        </div>
      );
    }

    // Skills (modified to alternate distribution)
if (Array.isArray(data?.skills) && data.skills.length > 0) {
    blocks.push(
      <div key="skills-section" className="resume-section">
        <div className="section-lines">
          <span className="section-title">Skills</span>
        </div>
      </div>
    );
    
    // Distribute skills alternately into two columns
    const col1 = [];
    const col2 = [];
    data.skills.forEach((skill, index) => {
      if (index % 2 === 0) {
        col1.push(skill);
      } else {
        col2.push(skill);
      }
    });
    
    blocks.push(
      <div key="skills-columns" className="skills-columns">
        <div className="skills-column">
          {col1.map((skill, i) => (
            <div key={`skill-col1-${i}`} className="skill-item">
              • {skill}
            </div>
          ))}
        </div>
        <div className="skills-column">
          {col2.map((skill, i) => (
            <div key={`skill-col2-${i}`} className="skill-item">
              • {skill}
            </div>
          ))}
        </div>
      </div>
    );
  }   

    // Projects
    if (Array.isArray(data?.projects) && data.projects.length > 0) {
      blocks.push(
        <div key="projects-section" className="resume-section">
          <div className="section-lines">
            <span className="section-title">Projects</span>
          </div>
        </div>
      );
      data.projects.forEach((project, index) => {
        // Project name
        blocks.push(
          <div key={`project-name-${index}`} className="project-name">
            {project.name || 'Project Name'}
          </div>
        );
        // Each task
        if (Array.isArray(project.tasks) && project.tasks.length > 0) {
          project.tasks.forEach((task, i) => {
            blocks.push(
              <div key={`task-${index}-${i}`} className="task-item">
                • {task}
              </div>
            );
          });
        }
      });
    }

    // Education
    if (Array.isArray(data?.education) && data.education.length > 0) {
      blocks.push(
        <div key="education-section" className="resume-section">
          <div className="section-lines">
            <span className="section-title">Education</span>
          </div>
        </div>
      );
      data.education.forEach((edu, index) => {
        blocks.push(
          <div key={`education-header-${index}`} className="education-header">
            <span className="education-name">
              {edu.institution || 'Your Institution'}
            </span>
            <span className="graduation-date">
              {edu.graduationDate || 'Graduation Date'}
            </span>
          </div>
        );
        blocks.push(
          <div key={`education-details-${index}`} className="education-details">
            <span className="course-name">{edu.course || 'Course Name'}</span>
            <span className="education-location">
              {edu.location || 'Location'}
            </span>
          </div>
        );
      });
    }

    return blocks;
  };

  // If no data
  if (!data || Object.keys(data).length === 0) {
    return (
      <p className="error-message">
        ⚠️ No resume data available. Please fill in the form.
      </p>
    );
  }

  return (
    <div className="resume-preview-wrapper" ref={ref}>
      { }
      <div
        ref={fullContentRef}
        style={{
          visibility: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${A4_WIDTH_PX}px`,  
          pointerEvents: 'none'
        }}
      >
        {renderResumeContent()}
      </div>

      {/* Render paginated pages */}
      {pages.map((htmlBlocks, index) => (
        <div
          key={index}
          className="resume-page"
          dangerouslySetInnerHTML={{ __html: htmlBlocks.join('') }}
        />
      ))}
    </div>
  );
});

export default ResumePreview;
