import { inngest } from "./client";
import { jobDescriptionAgent } from "./agents";
import { createNetwork } from "@inngest/agent-kit";
import { db } from "@/lib/db";
import { employerProfiles, locations, industries, skills } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

// Create a network with the job description agent
const jobDescriptionNetwork = createNetwork({
  name: "Job Description Network",
  agents: [jobDescriptionAgent],
  defaultModel: jobDescriptionAgent.model,
});

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
      locationId,
      experienceLevel,
      workLocation,
      jobType,
      industryIds,
      skillIds,
      numberOfOpenings,
      companyName,
      companyIndustry,
      requestId,
    } = event.data;

    // Fetch additional context data in parallel
    const contextData = await step.run("fetch-context-data", async () => {
      const database = await db();
      
      const [locationData, industriesData, skillsData] = await Promise.all([
        // Fetch location details if provided
        locationId
          ? database
              .select()
              .from(locations)
              .where(eq(locations.id, locationId))
              .limit(1)
          : Promise.resolve([]),
        
        // Fetch industries
        industryIds && industryIds.length > 0
          ? database
              .select()
              .from(industries)
              .where(inArray(industries.id, industryIds))
          : Promise.resolve([]),
        
        // Fetch skills
        skillIds && skillIds.length > 0
          ? database
              .select()
              .from(skills)
              .where(inArray(skills.id, skillIds))
          : Promise.resolve([]),
      ]);

      // Build location name from parts
      const location = locationData[0] 
        ? [locationData[0].city, locationData[0].district, locationData[0].region]
            .filter(Boolean)
            .join(', ')
        : '';

      return {
        location,
        industries: industriesData.map(i => i.name),
        skills: skillsData.map(s => s.name),
      };
    });

    // Build the prompt with all context
    const prompt = `Generate a compelling job description for the following position:

Job Title: ${title}
Company: ${companyName || 'Our company'}
Location: ${contextData.location || 'The Gambia'} (${workLocation})
Experience Level: ${experienceLevel || 'Not specified'}
Job Type: ${jobType}
Number of Openings: ${numberOfOpenings || 1}
Industries: ${contextData.industries.join(', ') || companyIndustry || 'Not specified'}
Key Skills: ${contextData.skills.join(', ') || 'To be determined'}

Please create a comprehensive job description that:
1. Starts with an engaging overview of the role and its importance
2. Lists 5-8 key responsibilities relevant to the ${title} position
3. Highlights what the company offers (benefits, growth, culture)
4. Explains why someone should join (impact, team, opportunities)
5. Is tailored for the ${contextData.location || 'Gambian'} job market

Format the output as clean HTML suitable for a rich text editor.`;

    // Generate the job description using the AI agent
    const result = await step.run("generate-description", async () => {
      try {
        const response = await jobDescriptionNetwork.run(prompt);

        // Extract the generated content from the response
        // AgentKit returns the final output as a string
        let content = '';
        
        // The response should contain the generated content
        if (response && typeof response === 'string') {
          content = response;
        } else if (response && typeof response === 'object') {
          // Handle case where response might be an object
          content = response.toString();
        }
        
        // Format the content as HTML
        if (content) {
          // Simple HTML formatting without using the tool directly
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
              // Check if it's a heading (starts with #)
              if (p.trim().startsWith('#')) {
                const level = p.match(/^#+/)?.[0].length || 1;
                const text = p.replace(/^#+\s*/, '').trim();
                return `<h${Math.min(level, 6)}>${text}</h${Math.min(level, 6)}>`;
              }
              // Regular paragraph
              return `<p>${p.trim()}</p>`;
            })
            .join('\n');
          
          return {
            success: true,
            description: formattedContent,
            requestId,
          };
        }

        return {
          success: false,
          error: "No content generated",
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

    // Store the result in a temporary cache or send via webhook
    // For now, we'll return the result which can be polled
    return result;
  }
);