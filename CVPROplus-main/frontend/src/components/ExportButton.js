import { saveAs } from "file-saver";
import { jsPDF } from "jspdf"; //for text-based PDF export
import { Document, Packer, Paragraph, TextRun, AlignmentType, TabStopType, UnderlineType, BorderStyle, Table, WidthType,  TableRow, TableCell, TableLayoutType, ExternalHyperlink} from "docx";
import "../CSS/Buttons.css";

const ExportButton = ({ targetRef, isFormValid, fileName, data, selectedTemplate = "freshie" }) => {    

    const generateSkillTable = (skills, style = {}) => {
        const rows = [];
    
        for (let i = 0; i < skills.length; i += 2) {
            const leftSkill = skills[i];
            const rightSkill = skills[i + 1];
    
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: leftSkill
                                ? [new Paragraph({
                                    children: [new TextRun({ text: `• ${leftSkill}`, ...style })],
                                    indent: { left: 350 },
                                    spacing: { after: 100 },
                                })]
                                : [new Paragraph("")],
                            borders: {
                                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                            },
                        }),
                        new TableCell({
                            children: rightSkill
                                ? [new Paragraph({
                                    children: [new TextRun({ text: `• ${rightSkill}`, ...style })],
                                    indent: { left: 350 },
                                    spacing: { after: 100 },
                                })]
                                : [new Paragraph("")],
                            borders: {
                                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                            },
                        }),
                    ],
                })
            );
        }
    
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
            layout: TableLayoutType.AUTOFIT,
        });
    };
    
    const generatePDF = () => {
      if (!data || Object.keys(data).length === 0) {
        alert("No resume data available for PDF export.");
        return;
      }
    
      const doc = new jsPDF("portrait", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
    
      const isExperienced = selectedTemplate === "experienced";
    
      // Margins & Spacing Variables
      let baseMargin = 10;
      let topPadding = 15;
      let bottomPadding = 0;
      let lineHeight = 6;      
      let sectionSpacing = 1;  // Minimal extra spacing
    
      if (isExperienced) {
        baseMargin = 20;
        topPadding = 20;
        bottomPadding = 0;
        lineHeight = 6;        
        sectionSpacing = 1;    
      }
    
      // Current vertical position
      let y = baseMargin + topPadding;
      const pageBottom = pageHeight - baseMargin - bottomPadding;
    
      // Helper to check if a new page is needed
      const addPageIfNeeded = (heightNeeded) => {
        if (y + heightNeeded > pageBottom) {
          doc.addPage();
          y = baseMargin + topPadding;
        }
      };
    
      // Section Title Functions
        const drawFreshieSectionTitle = (title) => {
        const headerLineOffset = y + lineHeight / 2;
        const headerTextOffset = 3;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        const upperTitle = title.toUpperCase();
        const textWidth = doc.getTextWidth(upperTitle);
        const centerX = pageWidth / 2;
        const halfText = textWidth / 2;
        const lineGap = 4;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(baseMargin + 1, headerLineOffset, centerX - (halfText + lineGap), headerLineOffset);
        doc.line(centerX + (halfText + lineGap), headerLineOffset, pageWidth - baseMargin - 1, headerLineOffset);
        doc.text(upperTitle, centerX - halfText, headerLineOffset + headerTextOffset);
        y += 10; 
      };
    
      const drawExperiencedSectionTitle = (title) => {
        // Space before the header 
        y += 4;
    
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
    
        const upperTitle = title.toUpperCase();
        doc.text(upperTitle, baseMargin, y);
    
        const textWidth = doc.getTextWidth(upperTitle);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(baseMargin, y + 2, baseMargin + textWidth, y + 2);
        y += 10;
      };
    
      // Header & Personal Info
      if (data.personal) {
        if (!isExperienced) {
          if (data.personal.name) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            const nameText = data.personal.name.toUpperCase();
            const nameWidth = doc.getTextWidth(nameText);
            const nameX = (pageWidth - nameWidth) / 2;
            doc.text(nameText, nameX, y);
            y += 10;
          }
          {
            const emailStr = (data.personal.email || "").trim();
            const phoneStr = (data.personal.phone || "").trim();
            const addressStr = (data.personal.address || "").trim();
            const extraParts = [];
            if (phoneStr) extraParts.push(phoneStr);
            if (addressStr) extraParts.push(addressStr);
            const extraStr = extraParts.join(" | ");
            const separator = extraStr ? " | " : "";
            const fullLine = emailStr + separator + extraStr;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            const lineWidth = doc.getTextWidth(fullLine);
            const emailWidth = doc.getTextWidth(emailStr);
            const startX = (pageWidth - lineWidth) / 2;
            const baseY = y;
            doc.setTextColor(0, 0, 0);
            doc.text(fullLine, startX, baseY);
            doc.setTextColor(10, 102, 194);
            doc.text(emailStr, startX, baseY);
            const linkHeight = 4;
            doc.link(
              startX,
              baseY - linkHeight,
              emailWidth,
              linkHeight,
              { url: `mailto:${emailStr}` }
            );
            doc.setTextColor(0, 0, 0);
            y += 6;
          }
          if (data.personal.linkedin) {
            const linkWidth = doc.getTextWidth(data.personal.linkedin);
            const linkX = (pageWidth - linkWidth) / 2;
            doc.setTextColor(10, 102, 194);
            doc.textWithLink(data.personal.linkedin, linkX, y, {
              url: data.personal.linkedin,
            });
            doc.setTextColor(0, 0, 0);
            y += 6;
          }
          doc.setLineWidth(0.5);
          doc.setDrawColor(0, 0, 0);
          doc.line(baseMargin + 1, y, pageWidth - baseMargin - 1, y);
          y += 8;
        } else {
          let yExp = y;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(24);
          if (data.personal.name) {
            doc.text(data.personal.name.toUpperCase(), baseMargin, yExp);
            yExp += 8;
          }
          doc.setFont("helvetica", "normal");
          doc.setFontSize(14);
    
          if (data.personal.email) {
            doc.setTextColor(26, 115, 232);
            doc.textWithLink(data.personal.email, baseMargin, yExp, {
              url: `mailto:${data.personal.email}`,
            });
            doc.setTextColor(0, 0, 0);
            yExp += 5; // smaller than lineHeight for tighter spacing
          }
          if (data.personal.phone) {
            doc.text(data.personal.phone, baseMargin, yExp);
            yExp += 5;
          }
          if (data.personal.address) {
            doc.text(data.personal.address, baseMargin, yExp);
            yExp += 5;
          }
          if (data.personal.linkedin) {
            doc.setTextColor(26, 115, 232);
            doc.textWithLink(data.personal.linkedin, baseMargin, yExp, {
              url: data.personal.linkedin,
            });
            doc.setTextColor(0, 0, 0);
            yExp += 5;
          }
          yExp += 3;
    
          // One full-width line
          doc.setLineWidth(0.5);
          doc.setDrawColor(0, 0, 0);
          doc.line(baseMargin, yExp, pageWidth - baseMargin, yExp);
          yExp += 5;
    
          y = yExp;
        }
      }
    
      // SUMMARY
      if (data.personal?.summary?.trim()) {
        addPageIfNeeded(lineHeight * 6);
    
        if (isExperienced) {
          drawExperiencedSectionTitle("Summary");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(14);
          const lines = doc.splitTextToSize(
            data.personal.summary,
            pageWidth - baseMargin * 2
          );
          addPageIfNeeded(lines.length * lineHeight);
          lines.forEach((line) => {
            doc.text(line, baseMargin, y);
            y += lineHeight;
          });
        } else {
          drawFreshieSectionTitle("Summary");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          const indent = baseMargin;
          const wrapped = doc.splitTextToSize(
            data.personal.summary,
            pageWidth - indent * 2
          );
          addPageIfNeeded(wrapped.length * lineHeight);
          wrapped.forEach((line) => {
            doc.text(line, indent, y);
            y += lineHeight;
          });
          y += sectionSpacing;
        }
      }
    
      // WORK EXPERIENCE
      if (isExperienced && data.experience && data.experience.length) {
        addPageIfNeeded(lineHeight * 6);
        drawExperiencedSectionTitle("Work Experience");
    
        data.experience.forEach((exp) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(15);
    
          const companyText = exp.company || "";
          doc.text(companyText, baseMargin, y);
    
          if (exp.startDate && exp.endDate) {
            const dateStr = `(${exp.startDate} - ${exp.endDate})`;
            const dateWidth = doc.getTextWidth(dateStr);
            doc.text(dateStr, pageWidth - baseMargin - dateWidth, y);
          }
          y += 5;
    
          if (exp.jobTitle || exp.location) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(14);
            doc.setTextColor(85, 85, 85);
            let jobLine = exp.jobTitle || "";
            if (exp.location) jobLine += " - " + exp.location;
            const jobSplit = doc.splitTextToSize(jobLine, pageWidth - baseMargin * 2);
            addPageIfNeeded(jobSplit.length * lineHeight);
            jobSplit.forEach((txt) => {
              doc.text(txt, baseMargin + 5, y);
              y += 5; 
            });
            doc.setTextColor(0, 0, 0);
          }
    
          // Tasks
          if (exp.tasks && exp.tasks.length) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(14);
            exp.tasks.forEach((task) => {
              const bullet = `• ${task}`;
              const bulletSplit = doc.splitTextToSize(
                bullet,
                pageWidth - baseMargin * 2 - 5
              );
              addPageIfNeeded(bulletSplit.length * lineHeight);
              bulletSplit.forEach((txt) => {
                doc.text(txt, baseMargin + 10, y);
                y += 7; 
              });
            });
          }
        });
      }
    
      // SKILLS
    if (data.skills && data.skills.length) {
      addPageIfNeeded(lineHeight * 6);
      if (isExperienced) {
        drawExperiencedSectionTitle("Skills");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);

        const colWidth = (pageWidth - baseMargin * 2) / 2;
        const col1 = [];
        const col2 = [];
        data.skills.forEach((skill, index) => {
          if (index % 2 === 0) {
            col1.push(`• ${skill}`);
          } else {
            col2.push(`• ${skill}`);
          }
        });
        const maxRows = Math.max(col1.length, col2.length);
        for (let i = 0; i < maxRows; i++) {
          const text1 = col1[i] || "";
          const text2 = col2[i] || "";
          addPageIfNeeded(lineHeight);
          doc.text(text1, baseMargin, y);
          doc.text(text2, baseMargin + colWidth, y);
          y += 7; 
        }
        y += sectionSpacing;
        } else {
          drawFreshieSectionTitle("Skills");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          const indent = baseMargin + 10;
          data.skills.forEach((skill) => {
            addPageIfNeeded(lineHeight);
            doc.text(`• ${skill}`, indent, y);
            y += 7; 
          });
          y += sectionSpacing;
        }
      }
    
      // PROJECTS
      if (data.projects && data.projects.length) {
        if (isExperienced) {
          addPageIfNeeded(lineHeight * 6);
          drawExperiencedSectionTitle("Projects");
    
          data.projects.forEach((project) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(15);
            const projName = project.name || "Untitled Project";
            const projSplit = doc.splitTextToSize(projName, pageWidth - baseMargin * 2);
            addPageIfNeeded(projSplit.length * lineHeight);
            projSplit.forEach((txt) => {
              doc.text(txt, baseMargin, y);
              y += 5;
            });
    
            doc.setFont("helvetica", "normal");
            doc.setFontSize(14);
            if (project.tasks && project.tasks.length) {
              project.tasks.forEach((task) => {
                const taskLine = `• ${task}`;
                const taskLines = doc.splitTextToSize(
                  taskLine,
                  pageWidth - baseMargin * 2 - 5
                );
                addPageIfNeeded(taskLines.length * lineHeight);
                taskLines.forEach((txt) => {
                  doc.text(txt, baseMargin + 10, y);
                  y += 6; 
                });
                y += 1;
              });
            }
          });
        } else {
          // Freshie
          addPageIfNeeded(lineHeight * 6);
          drawFreshieSectionTitle("Projects");
          data.projects.forEach((project) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            const projName = project.name || "Untitled Project";
            const projSplit = doc.splitTextToSize(projName, pageWidth - baseMargin * 2);
            addPageIfNeeded(projSplit.length * lineHeight);
            projSplit.forEach((line) => {
              doc.text(line, baseMargin, y);
              y += lineHeight;
            });
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            if (project.tasks && project.tasks.length) {
              const indent = baseMargin + 10;
              project.tasks.forEach((task) => {
                const bullet = `• ${task}`;
                const bulletSplit = doc.splitTextToSize(bullet, pageWidth - indent * 2);
                addPageIfNeeded(bulletSplit.length * lineHeight);
                bulletSplit.forEach((bLine) => {
                  doc.text(bLine, indent, y);
                  y += lineHeight;
                });
              });
            }
          });
        }
      }
    
      // EDUCATION
      if (data.education && data.education.length) {
        if (isExperienced) {
          addPageIfNeeded(lineHeight * 6);
          drawExperiencedSectionTitle("Education");
    
          data.education.forEach((edu) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            const institution = edu.institution || "";
            doc.text(institution, baseMargin, y);
    
            if (edu.graduationDate) {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(14);
              doc.setTextColor(85, 85, 85);
              const gradWidth = doc.getTextWidth(edu.graduationDate);
              doc.text(edu.graduationDate, pageWidth - baseMargin - gradWidth, y);
              doc.setTextColor(0, 0, 0);
            }
            y += 8;
    
            doc.setFont("helvetica", "italic");
            doc.setFontSize(14);
            const course = edu.course || "";
            doc.text(course, baseMargin, y);
            if (edu.location) {
              const locWidth = doc.getTextWidth(edu.location);
              doc.text(edu.location, pageWidth - baseMargin - locWidth, y);
            }
            y += 8;
          });
        } else {
          // Freshie
          addPageIfNeeded(lineHeight * 6);
          drawFreshieSectionTitle("Education");
          data.education.forEach((edu) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            const inst = edu.institution || "";
            const instSplit = doc.splitTextToSize(
              inst,
              pageWidth - baseMargin * 2
            );
            addPageIfNeeded(instSplit.length * lineHeight);
            instSplit.forEach((line) => {
              doc.text(line, baseMargin, y);
              y += lineHeight;
            });
            if (edu.graduationDate) {
              doc.setFont("helvetica", "bold");
              doc.setFontSize(12);
              doc.setTextColor(85, 85, 85);
              const dateWidth = doc.getTextWidth(edu.graduationDate);
              const linesUsed = instSplit.length;
              const dateY = y - lineHeight * linesUsed;
              doc.text(edu.graduationDate, pageWidth - baseMargin - dateWidth, dateY);
              doc.setTextColor(0, 0, 0);
            }
            y += 2;
            doc.setFont("helvetica", "italic");
            doc.setFontSize(12);
            const course = edu.course || "";
            if (course) {
              doc.text(course, baseMargin, y);
            }
            if (edu.location) {
              doc.setTextColor(85, 85, 85);
              const locWidth = doc.getTextWidth(edu.location);
              doc.text(edu.location, pageWidth - baseMargin - locWidth, y);
              doc.setTextColor(0, 0, 0);
            }
            y += lineHeight * 1.5;
          });
        }
      }

      doc.save(`${fileName}.pdf`);
    };    
    
    const generateDOCX = async () => {
      const isExperienced = selectedTemplate === "experienced";

        const resumeData = data;

        const addSectionSpacing = (height = 200) =>
          new Paragraph({
              children: [],
              spacing: { before: height },
          });

          // Accept 'doc' as parameter
          const createHyperlink = (url, displayText, style = {}) => {
            return new Paragraph({
              children: [
                new ExternalHyperlink({
                  link: url,
                  children: [
                    new TextRun({
                      text: displayText,
                      style: "Hyperlink",
                      color: "0A66C2",
                      underline: { type: UnderlineType.SINGLE },
                      bold: true,
                      ...style,
                    }),
                  ],
                }),
              ],
              alignment: templateStyles.alignment,
              spacing: { after: 100 },
            });
          };                
    
        if (
            !resumeData?.personal?.name ||
            !resumeData?.personal?.email ||
            !resumeData?.personal?.phone ||
            !resumeData?.personal?.address
        ) {
            alert("⚠️ Please fill in all personal details (name, email, phone, address) before exporting.");
            return;
        }

        const createParagraph = (text, style = {}) => {
            if (!text || text.trim() === "") return null;
            return new Paragraph({
                children: [new TextRun({ text, ...style })],
                indent: { left: 350 },
                alignment: templateStyles.alignment || AlignmentType.LEFT,
                spacing: { after: 150 },
            });
        };
    
        const generateList = (items, style = {}) =>
            (items || []).filter(Boolean).map((item) =>
                new Paragraph({
                    children: [new TextRun({ text: "• " + item, ...style })],
                    indent: { left: 350 },
                    spacing: { after: 100 },
                })
            );
    
            const sectionHeader = (title, style = {}) => {
              if (isExperienced) {
                  // Left-aligned underlined header for experienced template
                  return new Paragraph({
                      children: [
                          new TextRun({
                              text: title.toUpperCase(),
                              underline: {
                                  type: UnderlineType.SINGLE,
                                  color: style?.color || "000000",
                              },
                              ...style,
                          }),
                      ],
                      alignment: AlignmentType.LEFT,
                      spacing: { after: 150 },
                  });
              } else {
                  // Center-aligned header with decorative lines for freshie template
                  const docxPageWidth = 100;
                  const titleLength = title.length;
                  const lineLength = Math.max(15, Math.floor((docxPageWidth - titleLength * 2) / 2));
                  const leftLine = "─".repeat(lineLength);
                  const rightLine = "─".repeat(lineLength);
          
                  return new Paragraph({
                      children: [
                          new TextRun({ text: leftLine, bold: true, size: 14 }),
                          new TextRun({ text: `  ${title.toUpperCase()}  `, bold: true, size: 22, ...style }),
                          new TextRun({ text: rightLine, bold: true, size: 14 }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 100 },
                  });
              }
          };
          
        const freshieTemplate = {
            fontSize: 22,
            nameStyle: { bold: true, size: 36, color: "000000" },
            sectionStyle: { bold: true, size: 24, color: "000000" },
            textStyle: { size: 22, color: "000000" },
            listStyle: { size: 22, color: "000000" },
            italicsStyle: { italics: true, size: 22, color: "000000" },
            rightAlignStyle: { size: 22, color: "000000", alignment: AlignmentType.RIGHT },
            alignment: AlignmentType.CENTER,
        };

        const experiencedTemplate = {
          fontSize: 26,
          nameStyle: { bold: true, size: 36, color: "000000" },
          sectionStyle: { bold: true, size: 24, color: "000000" },
          textStyle: { size: 22, color: "000000" },
          listStyle: { size: 22, color: "000000" },
          italicsStyle: { italics: true, size: 22, color: "000000" },
          rightAlignStyle: { size: 22, color: "000000", alignment: AlignmentType.RIGHT },
          alignment: AlignmentType.LEFT,
      };

      const templateStyles = isExperienced ? experiencedTemplate : freshieTemplate;
    
      const doc = new Document({
        sections: [
            {
                properties: {
                    page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
                },
                children: [], 
            },
        ],
    });
    
        const docContent = [
            new Paragraph({
                children: [new TextRun({ text: resumeData.personal.name?.toUpperCase(), ...templateStyles.nameStyle })],
                alignment: templateStyles.alignment,
                spacing: { after: 40 }, 
            }),
    
            ...(isExperienced
              ? [
                resumeData.personal.email &&
                createHyperlink(`mailto:${resumeData.personal.email}`, resumeData.personal.email, {
                  bold: true,
                  ...templateStyles.textStyle,
                }),            
                  resumeData.personal.phone && new Paragraph({
                    children: [new TextRun({ text: resumeData.personal.phone, ...templateStyles.textStyle })],
                    alignment: AlignmentType.LEFT,
                  }),
                  resumeData.personal.address && new Paragraph({
                    children: [new TextRun({ text: resumeData.personal.address, ...templateStyles.textStyle })],
                    alignment: AlignmentType.LEFT,
                  }),
                ].filter(Boolean)
              : [
                new Paragraph({
                  children: [
                    new ExternalHyperlink({
                      link: `mailto:${resumeData.personal.email}`,
                      children: [
                        new TextRun({
                          text: resumeData.personal.email,
                          color: "0A66C2",
                          underline: { type: UnderlineType.SINGLE },
                          bold: true,
                          ...templateStyles.textStyle,
                        }),
                      ],
                    }),                                
                      new TextRun({ text: " | " }),
                      new TextRun({ text: resumeData.personal.phone || "", ...templateStyles.textStyle }),
                      new TextRun({ text: " | " }),
                      new TextRun({ text: resumeData.personal.address || "", ...templateStyles.textStyle }),
                    ],
                    alignment: templateStyles.alignment,
                  }),
                ]),
                
                ...(resumeData.personal?.linkedin?.trim()
                ? [
                    createHyperlink(doc, resumeData.personal.linkedin, resumeData.personal.linkedin, {
                      bold: true,
                      ...templateStyles.textStyle,
                      spacing: { after: 40 },
                    }),
                  ]
                : []),              

            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("")],
                        borders: {
                          top: { style: BorderStyle.SINGLE, size: 14, color: "000000" },
                          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, // Thicker line
                          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                        },
                      }),
                    ],
                  }),
                ],
                layout: TableLayoutType.AUTOFIT,
                spacing: { after: 40 },
              }),
              
            // Optional Summary Section (only if non-empty)
            ...(resumeData.personal?.summary?.trim()
            ? [
                sectionHeader("SUMMARY", templateStyles.sectionStyle),
                new Paragraph({
                  children: [new TextRun({ text: resumeData.personal.summary, ...templateStyles.textStyle })],
                  alignment: AlignmentType.LEFT, 
                  indent: { left: 350 },
                  spacing: { after: 150 },
                }),
               ]
            : []),
    
            // Experience Section (Only for 'experienced' template)
...(isExperienced && resumeData.experience?.length
    ? [
        sectionHeader("EXPERIENCE", templateStyles.sectionStyle),
        ...resumeData.experience.flatMap((exp) => {
          const leftIndent = 350;
          return [
            new Paragraph({
              children: [
                new TextRun({ text: exp.company || "", bold: true, size: 26 }),
                new TextRun({
                  text: exp.startDate && exp.endDate ? `\t${exp.startDate} - ${exp.endDate}` : "",
                  size: 20, 
                }),
              ],
              tabStops: [
                {
                  type: TabStopType.RIGHT,
                  position: 9350,
                },
              ],
              indent: { left: leftIndent },
              spacing: { after: 50 },
            }),
  
            new Paragraph({
              children: [
                new TextRun({ text: exp.jobTitle || "", size: templateStyles.fontSize }),
                new TextRun({
                  text: exp.location ? `\t${exp.location}` : "",
                  italics: true,
                  size: 22,
                }),
              ],
              tabStops: [
                {
                  type: TabStopType.RIGHT,
                  position: 9350,
                },
              ],
              indent: { left: leftIndent },
              spacing: { after: 100 },
            }),
  
            // Tasks
            ...(exp.tasks && Array.isArray(exp.tasks)
              ? generateList(exp.tasks, templateStyles.listStyle)
              : []),
          ].filter(Boolean);
        }),
      ]
    : []),
  
            ...(resumeData.skills?.length ? [addSectionSpacing(), sectionHeader("SKILLS", templateStyles.sectionStyle)] : []),
            ...(resumeData.skills?.length ? [generateSkillTable(resumeData.skills, templateStyles.listStyle)] : []),

            ...(resumeData.projects?.length ? [addSectionSpacing(), sectionHeader("PROJECTS", templateStyles.sectionStyle)] : []),
            ...(resumeData.projects?.length
                ? resumeData.projects.flatMap((project) => [
                  new Paragraph({
                    children: [new TextRun({ text: project.name, bold: true, size: 24 })],
                    alignment: AlignmentType.LEFT,
                    spacing: { after: 100 },
                    indent: { left: 350 },
                  }),
                    ...generateList(project.tasks || [], templateStyles.listStyle),
                    addSectionSpacing(150),
                  ])
                : []),

                ...(resumeData.education?.length ? [addSectionSpacing(), sectionHeader("EDUCATION", templateStyles.sectionStyle)] : []),
                ...(resumeData.education?.length
                  ? resumeData.education.flatMap((edu) => {
                      const leftIndent = 350;
                      return [
                        new Paragraph({
                          children: [
                            new TextRun({ text: edu.institution || "", bold: true, size: 24 }),
                            new TextRun({
                              text: edu.graduationDate ? "\t" + edu.graduationDate : "",
                              size: 20, 
                            }),
                          ],
                          tabStops: [
                            {
                              type: TabStopType.RIGHT,
                              position: 9350, 
                            },
                          ],
                          indent: { left: leftIndent },
                          spacing: { after: 100 },
                        }),
                
                        new Paragraph({
                          children: [
                            new TextRun({ text: edu.course || "", italics: true, size: 22 }),
                            new TextRun({
                              text: edu.location ? "\t" + edu.location : "",
                              italics: true,
                              size: 22,
                            }),
                          ],
                          tabStops: [
                            {
                              type: TabStopType.RIGHT,
                              position: 9350,
                            },
                          ],
                          indent: { left: leftIndent },
                          spacing: { after: 150 },
                        }),
                      ];
                    })
                  : []),
                
        ].filter(Boolean);
    
        try {
            if (docContent.length === 0) {
                alert("⚠️ Cannot generate an empty document.");
                return;
            }
    
            const doc = new Document({
                sections: [
                    {
                        properties: {
                            page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
                        },
                        children: docContent,
                    },
                ],
            });
    
            const blob = await Packer.toBlob(doc);
    
            if (blob.size === 0) {
                throw new Error("Generated DOCX file is empty!");
            }
    
            saveAs(blob, `${fileName}.docx`);
            alert("✅ Resume successfully exported as DOCX!");
        } catch (error) {
            console.error("❌ Error generating DOCX:", error);
            alert("Failed to export resume as DOCX.");
        }
    };    
    
    return (
      <div className="flex items-center justify-start gap-4 mt-2">
      <button 
        onClick={generatePDF} 
        className={`w-auto p-3 bg-gray-700 text-white font-semibold rounded-lg 
          hover:bg-gray-900 transition-transform transform hover:scale-105 
          focus:outline-none focus:ring-4 focus:ring-gray-500 
          ${isFormValid ? '' : 'cursor-not-allowed bg-gray-500'}`}
        disabled={!isFormValid}
      >
        Export as PDF
      </button>
      <button 
        onClick={generateDOCX} 
        className={`w-auto p-3 bg-gray-700 text-white font-semibold rounded-lg 
          hover:bg-gray-900 transition-transform transform hover:scale-105 
          focus:outline-none focus:ring-4 focus:ring-gray-500 
          ${isFormValid ? '' : 'cursor-not-allowed bg-gray-500'}`}
        disabled={!isFormValid}
      >
        Export as DOCX
      </button>
    </div>
    );
};

export default ExportButton;