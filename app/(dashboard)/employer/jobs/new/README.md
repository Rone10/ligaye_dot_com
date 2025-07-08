# AI-Enhanced Job Creation Flow

## Overview

This document details the implementation of AI-powered job description generation in the Ligaye.com job board platform. The system uses Google's Gemini AI model through Inngest for workflow orchestration, providing employers with intelligent assistance when creating job postings.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Client Form   │────▶│  Server Actions  │────▶│  Inngest Event  │
│ (React/Next.js) │     │   (_actions.ts)  │     │   (Tracking)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │   Gemini API     │
                        │ (Direct Call)    │
                        └──────────────────┘
```

## Key Components

### 1. Form Components (`_components/form-steps/`)

#### PostingSettingsStep.tsx
- **Purpose**: Final step in job creation form where AI enhancement is available
- **Key Features**:
  - "Enhance with AI" button next to job description field
  - Fetches context data (skills, industries, locations) on mount
  - Maps IDs to human-readable names for better AI context
  - Displays loading state during AI generation

#### Data Context Fetching
```typescript
// Fetches all necessary context for AI generation
const result = await fetchAIContextData()
// Returns: skills[], industries[], locations[], employerProfile
```

### 2. Server Actions (`_actions.ts`)

#### fetchAIContextData()
- **Purpose**: Gathers all reference data needed for AI context
- **Returns**: Skills, industries, locations, and employer profile
- **Security**: Requires authenticated user

#### generateJobDescription()
- **Purpose**: Main orchestrator for AI generation
- **Process**:
  1. Validates user authentication
  2. Sends tracking event to Inngest
  3. Calls Gemini API directly with full context
  4. Formats response as HTML
  5. Returns generated content

### 3. Inngest Integration (`/inngest/`)

#### Structure
```
/inngest/
├── client.ts      # Inngest client configuration
├── agents.ts      # AI agent definitions
└── functions.ts   # Inngest function handlers
```

#### agents.ts
- **jobDescriptionWriter**: Main agent for job descriptions
  - Configured with Gemini model
  - System prompt tailored for Gambian market
  - HTML output formatting instructions

#### functions.ts
- **jobDescriptionFunction**: Handles the generation event
  - Processes job details from event data
  - Runs the AI agent
  - Formats output for rich text editor

## Data Flow

### 1. User Interaction
```
User fills form → Clicks "Enhance with AI" → handleGenerateDescription()
```

### 2. Context Gathering
```typescript
// PostingSettingsStep.tsx
const selectedSkills = formValues.skillIds
  .map(id => skills.find(skill => skill.id === id)?.name)
  .filter(Boolean) as string[]

// Maps IDs to names for: skills, industries, locations
```

### 3. Server Action Flow
```typescript
// _actions.ts
generateJobDescription({
  title: "Software Engineer",
  location: "Banjul, Greater Banjul Area, The Gambia",
  skills: ["JavaScript", "React", "Node.js"],
  industries: ["Technology", "Software Development"],
  // ... other fields
})
```

### 4. AI Generation
```typescript
// Direct Gemini API call
const prompt = `Generate job description for:
  Job Title: ${title}
  Location: ${location}
  Skills: ${skills.join(', ')}
  // ... comprehensive context
`

const result = await model.generateContent(prompt)
```

### 5. Response Processing
- AI response is cleaned of any markdown formatting
- Converted to HTML with proper tags (`<h3>`, `<p>`, `<ul>`, `<li>`)
- Returned to form and inserted into rich text editor

## Environment Configuration

### Required Environment Variables
```env
# AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Inngest Configuration (for event tracking)
INNGEST_APP_ID=ligaye-job-board
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

### Development Setup
```bash
# Install dependencies
pnpm install

# Run Inngest dev server (optional, for event monitoring)
pnpm dev:inngest

# Run Next.js dev server
pnpm dev
```

## Adding New AI Features

### 1. Creating a New Agent

#### Step 1: Define the Agent (`/inngest/agents.ts`)
```typescript
export const resumeScreenerAgent = createAgent({
  name: "resume-screener",
  description: "Screens resumes against job requirements",
  system: `You are an expert recruiter. Analyze resumes against job requirements 
           and provide detailed screening reports...`,
  model: gemini({ 
    model: "gemini-1.5-flash",
    apiKey: process.env.GEMINI_API_KEY
  }),
  tools: [], // Add custom tools if needed
});
```

#### Step 2: Create Inngest Function (`/inngest/functions.ts`)
```typescript
export const resumeScreeningFunction = inngest.createFunction(
  {
    id: "screen-resume",
    name: "Screen Resume Against Job",
  },
  { event: "resume.screen" },
  async ({ event, step }) => {
    const { resumeContent, jobRequirements } = event.data;
    
    const result = await step.run("screen-resume", async () => {
      const response = await resumeScreenerAgent.run(
        `Screen this resume: ${resumeContent} 
         Against these requirements: ${jobRequirements}`
      );
      return { screening: response };
    });
    
    return result;
  }
);
```

#### Step 3: Create Server Action
```typescript
export async function screenResume(resumeData: ResumeData) {
  // Validate user
  const user = await getCachedUser()
  if (!user) return { error: 'Unauthorized' }
  
  // Send to Inngest
  await inngest.send({
    name: "resume.screen",
    data: resumeData
  })
  
  // Direct API call for immediate response
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const result = await model.generateContent(prompt)
  return { screening: result.response.text() }
}
```

### 2. Swapping AI Models

#### For OpenAI
```typescript
// In agents.ts
import { openai } from "@inngest/agent-kit";

export const jobDescriptionWriter = createAgent({
  // ... same config
  model: openai({ 
    model: "gpt-4-turbo",
    apiKey: process.env.OPENAI_API_KEY
  }),
});

// In _actions.ts
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const completion = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [{ role: "user", content: prompt }],
});
```

#### For Anthropic Claude
```typescript
// In agents.ts
import { anthropic } from "@inngest/agent-kit";

export const jobDescriptionWriter = createAgent({
  // ... same config
  model: anthropic({ 
    model: "claude-3-5-sonnet-latest",
    apiKey: process.env.ANTHROPIC_API_KEY
  }),
});

// In _actions.ts
import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const message = await anthropic.messages.create({
  model: "claude-3-5-sonnet-latest",
  messages: [{ role: "user", content: prompt }],
});
```

### 3. Adding Multi-Agent Workflows

```typescript
// Create a network of agents for complex tasks
import { createNetwork } from "@inngest/agent-kit";

const hiringNetwork = createNetwork({
  name: "Hiring Assistant Network",
  agents: [
    jobDescriptionWriter,
    interviewQuestionGenerator,
    candidateEvaluator
  ],
  defaultModel: gemini({ 
    model: "gemini-1.5-flash",
    apiKey: process.env.GEMINI_API_KEY
  })
});

// Use in function
const result = await hiringNetwork.run({
  messages: [
    { role: "system", content: "You are a hiring assistant" },
    { role: "user", content: "Create interview questions for: ..." }
  ]
});
```

## Best Practices

### 1. Context Preparation
- Always map IDs to human-readable names
- Include all relevant form data in prompts
- Structure prompts clearly with labeled sections

### 2. Error Handling
```typescript
try {
  const result = await model.generateContent(prompt)
  return { success: true, data: result }
} catch (error) {
  console.error('AI Generation failed:', error)
  return { success: false, error: 'Generation failed' }
}
```

### 3. Performance Optimization
- Cache reference data (skills, industries) using React hooks
- Use server actions for all AI operations
- Implement proper loading states

### 4. Security
- Always validate user authentication
- Sanitize user inputs before sending to AI
- Never expose API keys to client

## Testing AI Features

### Manual Testing
1. Fill out job form completely
2. Click "Enhance with AI"
3. Verify:
   - Loading state appears
   - Generated content is relevant
   - HTML formatting is correct
   - Context (skills, location) is properly included

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "No router or model defined" | Ensure agent has model configured |
| Empty AI response | Check API key and model availability |
| Formatting issues | Verify HTML cleaning logic |
| Missing context | Ensure data fetching completes before generation |

## Future Enhancements

### Planned Features
1. **Interview Question Generator**: Generate role-specific interview questions
2. **Candidate Matcher**: AI-powered candidate-job matching
3. **Resume Parser**: Extract structured data from resumes
4. **Job Market Insights**: AI analysis of job market trends

### Implementation Checklist for New Features
- [ ] Define clear use case and user flow
- [ ] Create agent with appropriate system prompt
- [ ] Set up Inngest function for event handling
- [ ] Implement server action with direct API call
- [ ] Add UI components with loading states
- [ ] Handle errors gracefully
- [ ] Test with various inputs
- [ ] Document the feature

## Monitoring & Debugging

### Inngest Dashboard
Access at `http://localhost:8288` during development to:
- View event logs
- Monitor function executions
- Debug failed runs

### Logging
```typescript
console.log('AI Generation Request:', {
  title: jobDetails.title,
  skills: jobDetails.skills,
  timestamp: new Date().toISOString()
})
```

## Conclusion

This AI integration provides a foundation for intelligent features throughout the Ligaye.com platform. The modular architecture allows easy addition of new agents and swapping of AI providers while maintaining consistent patterns and user experience.

For questions or contributions, please refer to the main project documentation or contact the development team.