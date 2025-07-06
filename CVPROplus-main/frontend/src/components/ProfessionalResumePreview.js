import React, { memo, forwardRef, useEffect, useRef, useState } from 'react';
import '../CSS/ProfessionalResumePreview.css';

// Section Component
const Section = ({ title, children }) => (
  <div className="resume-section-prof">
    <div className="section-lines-prof">
      <span className="section-title-prof">{title}</span>
    </div>
    {children}
  </div>
);

// Professional Resume Preview Component with Pagination Logic
const ProfessionalResumePreview = memo(
  forwardRef(({ data }, ref) => {
    const fullContentRef = useRef(null);
    const [pages, setPages] = useState([]);

    // A4 dimensions in pixels 
    const A4_HEIGHT_PX = 1122;
    const A4_WIDTH_PX = 794;

    /**
     * Renders all resume sections as a series of blocks.
     * These blocks will later be measured and split into pages.
     */
    const renderResumeContent = () => {
      if (!data || Object.keys(data).length === 0) return [];

      const blocks = [];

      // Header
      blocks.push(
        <div key="header-prof" className="resume-header-prof">
          <div className="header-left-prof">
            <h1>{data?.personal?.name || "Your Name"}</h1>
            <p className="resume-email-prof">
              <a
                href={`mailto:${data?.personal?.email || "your.email@example.com"}`}
                className="contact-link"
              >
                {data?.personal?.email || "your.email@example.com"}
              </a>
            </p>
            <p className="resume-phone-prof">
              {data?.personal?.phone || "000-000-0000"}
            </p>
            <p className="resume-location-prof">
              {data?.personal?.address || "Your Address"}
            </p>
            {data?.personal?.linkedin && (
              <p className="resume-linkedin-prof">
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
        </div>
      );

      // Summary Section
      if (data?.personal?.summary) {
        blocks.push(
          <div key="summary-section-prof" className="resume-section-prof">
            <div className="section-lines-prof">
              <span className="section-title-prof">Summary</span>
            </div>
          </div>
        );
        blocks.push(
          <div key="summary-content-prof" className="section-content-prof">
            <p>{data.personal.summary}</p>
          </div>
        );
      }

      // Work Experience Section
      if (data?.experience?.length > 0) {
        blocks.push(
          <Section key="experience-section-prof" title="Work Experience">
            {data.experience.map((experience, index) => (
              <div key={index} className="work-experience-item-prof">
                <div className="work-header-prof">
                  <span className="work-company-name-prof">
                    {experience.company || "Company Name"}
                  </span>
                  <span className="work-dates-prof">
                    {experience.startDate || "Start Date"} -{' '}
                    {experience.endDate || "End Date"}
                  </span>
                </div>
                <div className="work-header-prof">
                  <span className="work-role-prof">
                    {experience.jobTitle || "Job Title"}
                  </span>
                  <span className="work-location-prof">
                    {experience.location ? experience.location : ""}
                  </span>
                </div>
                <ul className="work-tasks-prof">
                  {experience.tasks?.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        );
      }

      if (data?.skills?.length > 0) {
        blocks.push(
          <Section key="skills-section-prof" title="Skills">
            <ul className="skills-list-prof">
              {data.skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </Section>
        );
      }      

      // Projects Section
      if (data?.projects?.length > 0) {
        blocks.push(
          <Section key="projects-section-prof" title="Projects">
            {data.projects.map((project, index) => (
              <div key={index} className="project-item-prof">
                <span className="project-name-prof">{project.name}</span>
                <ul className="task-list-prof">
                  {project.tasks?.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>
        );
      }

      // Education Section
      if (data?.education?.length > 0) {
        blocks.push(
          <Section key="education-section-prof" title="Education">
            {data.education.map((education, index) => (
              <div key={index} className="education-item-prof">
                <div className="education-header-prof">
                  <span className="education-name-prof">
                    {education.institution || "Your Institution"}
                  </span>
                  <span className="graduation-date-prof">
                    {education.graduationDate || "Graduation Date"}
                  </span>
                </div>
                <div className="education-details-prof">
                  <span className="course-name-prof">
                    {education.course || "Course Name"}
                  </span>
                  <span className="education-location-prof">
                    {education.location || "Location"}
                  </span>
                </div>
              </div>
            ))}
          </Section>
        );
      }

      return blocks;
    };

    // Pagination: After content is rendered, measure and split into pages.
    useEffect(() => {
      if (!data || Object.keys(data).length === 0) return;

      // Allow DOM to render before measuring.
      setTimeout(() => {
        if (!fullContentRef.current) return;

        const contentBlocks = Array.from(fullContentRef.current.children);
        let currentPage = [];
        let pagesArray = [];
        let pageHeight = 0;

        contentBlocks.forEach((node) => {
          const nodeHeight = node.offsetHeight;

          // If adding this block exceeds A4 height, start a new page.
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

    if (!data || Object.keys(data).length === 0) {
      return (
        <p className="error-message-prof">
          ⚠️ No resume data available. Please fill in the form.
        </p>
      );
    }

    return (
      <div className="resume-preview-prof-wrapper" ref={ref}>
        {/* Invisible container for measuring */}
        <div
          ref={fullContentRef}
          style={{
            visibility: 'hidden',
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${A4_WIDTH_PX}px`,
            pointerEvents: 'none',
          }}
        >
          {renderResumeContent()}
        </div>

        {/* Render paginated pages */}
        {pages.map((htmlBlocks, index) => (
          <div
            key={index}
            className="resume-page-prof"
            dangerouslySetInnerHTML={{ __html: htmlBlocks.join('') }}
          />
        ))}
      </div>
    );
  })
);

export default ProfessionalResumePreview;
