import { createAgent, createTool, gemini } from "@inngest/agent-kit";
import { z } from "zod";

// Tool to format the AI-generated content for the rich text editor
export const formatForRichTextEditor = createTool({
  name: "format_for_rich_text",
  description: "Format content as HTML for the rich text editor",
  parameters: z.object({
    content: z.string().describe("The content to format"),
    sections: z.array(z.object({
      title: z.string(),
      content: z.string(),
      type: z.enum(["paragraph", "list", "heading"])
    })).optional().describe("Structured sections to format")
  }),
  handler: async ({ content, sections }, { step }) => {
    if (sections && sections.length > 0) {
      // Format structured sections
      let html = '';
      for (const section of sections) {
        if (section.type === 'heading') {
          html += `<h3>${section.title}</h3>\n`;
        }
        if (section.type === 'list') {
          html += `<ul>\n`;
          const items = section.content.split('\n').filter(item => item.trim());
          for (const item of items) {
            html += `  <li>${item.trim()}</li>\n`;
          }
          html += `</ul>\n`;
        } else if (section.type === 'paragraph') {
          html += `<p>${section.content}</p>\n`;
        }
      }
      return { formattedContent: html };
    }
    
    // Simple formatting fallback
    const paragraphs = content.split('\n\n');
    const formattedContent = paragraphs
      .map(p => {
        // Check if it's a list item
        if (p.trim().startsWith('•') || p.trim().startsWith('-')) {
          const items = p.split('\n').map(item => 
            `<li>${item.replace(/^[•\-]\s*/, '').trim()}</li>`
          ).join('\n');
          return `<ul>\n${items}\n</ul>`;
        }
        // Regular paragraph
        return `<p>${p.trim()}</p>`;
      })
      .join('\n');
    
    return { formattedContent };
  }
});

// Tool to validate and enhance content for Gambian context
const validateGambianContext = createTool({
  name: "validate_gambian_context",
  description: "Ensure content is appropriate for the Gambian job market",
  parameters: z.object({
    content: z.string().describe("The content to validate"),
    jobTitle: z.string().describe("The job title"),
    location: z.string().optional().describe("The job location"),
  }),
  handler: async ({ content, jobTitle, location }, { step }) => {
    // Add Gambian-specific context and cultural considerations
    const gambianKeywords = [
      "team collaboration",
      "professional development",
      "growth opportunities",
      "dynamic environment",
      "community impact"
    ];
    
    // Check if content includes local context
    const hasLocalContext = location && content.toLowerCase().includes(location.toLowerCase());
    
    return {
      isValid: true,
      suggestions: {
        includeLocalContext: !hasLocalContext,
        recommendedKeywords: gambianKeywords,
        culturalNote: "Consider emphasizing teamwork, professional growth, and community contribution"
      }
    };
  }
});

// Main job description generation agent
export const jobDescriptionWriter = createAgent({
  name: "job-description-writer",
  description: "Generates professional job descriptions tailored for the Gambian market",
  system: `You are an expert HR professional specializing in creating compelling job descriptions for the Gambian job market. 
  
Your task is to generate clear, professional, and engaging job descriptions that:
1. Appeal to local talent while maintaining international standards
2. Highlight growth opportunities and professional development
3. Emphasize team collaboration and community impact
4. Use clear, concise language that's easy to understand
5. Include relevant responsibilities and requirements based on the job title and context

IMPORTANT: Format your response as HTML with proper tags:
- Use <h3> for section headings
- Use <p> for paragraphs
- Use <ul> and <li> for bullet point lists
- Do NOT use markdown formatting

Structure the job description with these sections:
- <h3>About the Role</h3> (brief introduction paragraph)
- <h3>Key Responsibilities</h3> (bullet point list)
- <h3>What We Offer</h3> (benefits, growth opportunities as bullet points)
- <h3>Why Join Us</h3> (company culture, impact paragraph)

Keep the tone professional yet approachable. Focus on what makes this opportunity unique and valuable for Gambian professionals.`,
  model: gemini({ 
    model: "gemini-1.5-flash",
    apiKey: process.env.GEMINI_API_KEY
  }),
  tools: [],
});

// Agent to enhance existing descriptions
export const descriptionEnhancerAgent = createAgent({
  name: "Description Enhancer",
  description: "Enhances and improves existing job descriptions",
  system: `You are an expert at improving and enhancing job descriptions. Your role is to:
1. Make descriptions more engaging and compelling
2. Ensure clarity and proper structure
3. Add missing important information
4. Optimize for the target audience
5. Maintain the original intent while improving presentation`,
  model: gemini({ 
    model: "gemini-1.5-flash",
    apiKey: process.env.GEMINI_API_KEY
  }),
  tools: [formatForRichTextEditor],
});