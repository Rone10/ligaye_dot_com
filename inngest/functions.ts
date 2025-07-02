import { inngest } from "./client";
import { jobDescriptionWriter } from "./agents";

// We'll use the agent directly instead of a network for simplicity

export const jobDescriptionFunction = inngest.createFunction(
  {
    id: "generate-job-description",
    name: "Generate Job Description",
    concurrency: {
      limit: 5, // Limit concurrent executions
    },
  },
  { event: "job.description.generate" },
  async ({ event, step }) => {
    // Extract job details from the event
    const {
      title,
      location,
      experienceLevel,
      workLocation,
      jobType,
      industries,
      skills,
      numberOfOpenings,
      companyName,
      companyIndustry,
      jobLanguage,
      benefits,
      supplementalPay,
      educationRequirements,
      experienceRequirements,
      requestId,
    } = event.data;

    // Build the prompt with all context
    const userPrompt = {
      role: "user",
      content: `Generate a compelling job description for:

Job Title: ${title}
Company: ${companyName || 'Our company'}
Location: ${location || 'The Gambia'} (${workLocation})
Experience Level: ${experienceLevel || 'Not specified'}
Job Type: ${jobType}
Number of Openings: ${numberOfOpenings || 1}
Industries: ${industries?.join(', ') || companyIndustry || 'Not specified'}
Key Skills: ${skills?.join(', ') || 'To be determined'}
Language: ${jobLanguage || 'English'}
${benefits?.length ? `Benefits: ${benefits.join(', ')}` : ''}
${supplementalPay?.length ? `Supplemental Pay: ${supplementalPay.join(', ')}` : ''}
${educationRequirements ? `Education Requirements: ${educationRequirements}` : ''}
${experienceRequirements ? `Experience Requirements: ${experienceRequirements}` : ''}

Create a job description with:
1. An engaging overview of the role
2. 5-8 key responsibilities for ${title}
3. What the company offers (benefits, growth)
4. Why someone should join
5. Tailored for the ${location || 'Gambian'} market

Format as HTML with <h3> headings and <ul>/<li> for lists.`
    };

    // Generate the job description using the AI agent
    const result = await step.run("generate-description", async () => {
      try {
        console.log("Running job description agent...");
        
        // Run the agent with the structured prompt
        const response = await jobDescriptionWriter.run(userPrompt.content);
        
        console.log("Network response type:", typeof response);
        console.log("Network response:", response);

        // Extract the generated content from the response
        let content = '';
        
        // Handle different response formats from Gemini
        if (response && typeof response === 'string') {
          content = response;
        } else if (response && typeof response === 'object') {
          // Check for common response structures
          const resp = response as any;
          if ('output' in resp && typeof resp.output === 'string') {
            content = resp.output;
          } else if ('text' in resp && typeof resp.text === 'string') {
            content = resp.text;
          } else if ('content' in resp && typeof resp.content === 'string') {
            content = resp.content;
          } else if ('result' in resp && typeof resp.result === 'string') {
            content = resp.result;
          } else {
            // Fallback: try to extract any string content
            content = JSON.stringify(response);
          }
        }
        
        console.log("Extracted content:", content ? content.substring(0, 200) + "..." : "No content");
        
        // Format the content as HTML
        if (content && content.trim()) {
          // Check if content is already HTML
          if (content.includes('<h') || content.includes('<p>') || content.includes('<ul>')) {
            return {
              success: true,
              description: content,
              requestId,
            };
          }
          
          // Otherwise, format as HTML
          const paragraphs = content.split('\n\n');
          const formattedContent = paragraphs
            .map(p => {
              const trimmed = p.trim();
              if (!trimmed) return '';
              
              // Check if it's a list item
              if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
                const items = trimmed.split('\n')
                  .filter(item => item.trim())
                  .map(item => 
                    `<li>${item.replace(/^[•\-\*]\s*/, '').trim()}</li>`
                  ).join('\n');
                return `<ul>\n${items}\n</ul>`;
              }
              // Check if it's a heading
              if (trimmed.startsWith('#')) {
                const level = trimmed.match(/^#+/)?.[0].length || 1;
                const text = trimmed.replace(/^#+\s*/, '').trim();
                return `<h${Math.min(level + 2, 6)}>${text}</h${Math.min(level + 2, 6)}>`;
              }
              // Check for bold text (common in Gemini responses)
              if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                const text = trimmed.slice(2, -2).trim();
                return `<h3>${text}</h3>`;
              }
              // Regular paragraph
              return `<p>${trimmed}</p>`;
            })
            .filter(p => p) // Remove empty strings
            .join('\n\n');
          
          return {
            success: true,
            description: formattedContent,
            requestId,
          };
        }

        return {
          success: false,
          error: "No content generated from AI",
          requestId,
        };
      } catch (error) {
        console.error("Error generating description:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate description",
          requestId,
        };
      }
    });

    // Return the result
    return result;
  }
);



export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);
