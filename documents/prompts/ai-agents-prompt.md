**AI Agent Integration for Job Description Generation - Planning Discussion**

I want to integrate AI agents into the Ligaye.com job board platform to help employers generate job descriptions. I'd like to discuss the architecture and implementation approach before we start coding.

**Current Context:**
- The job posting flow currently has 4 steps, with job description input happening in step 2
- We're using a rich text editor for the job description field
- The project follows Vertical Slice Architecture with features organized within route segments
- We use Server Actions for mutations and Supabase for the backend

**Proposed Solution Overview:**
1. Move job description to the final step (step 4) so the AI can use all previously entered job details as context
2. Use Inngest for orchestrating the AI agent workflow
3. Integrate with an LLM provider (Anthropic, OpenAI, or Google Gemini)
4. Format the AI response to work seamlessly with our rich text editor
5. Allow users to edit the generated description before final submission

**Key Discussion Points I'd Like to Explore:**

1. **Architecture & Data Flow:**
   - How should we structure the Inngest functions within our VSA approach? Should they live in the job posting route segment (e.g., `app/jobs/new/_inngest/`)?
   - What's the best way to pass job context from steps 1-3 to the AI agent in step 4?
   - Should we store partial job data in a temporary table or use session storage?

2. **Rich Text Editor Integration:**
   - Our rich text editor expects specific formatting - how do we ensure the AI response is properly formatted?
   - Should we parse the AI's markdown/plain text response into the editor's expected format?
   - How do we handle streaming responses vs. waiting for the complete description?

3. **LLM Provider Strategy:**
   - Which provider would you recommend starting with and why?
   - Should we abstract the LLM calls to easily switch providers later?
   - How do we structure the prompts to get job descriptions that match Gambian market expectations?

4. **User Experience Considerations:**
   - How do we handle the UI while waiting for AI generation (loading states, progress indicators)?
   - Should we offer multiple generation attempts or variations?
   - What happens if the AI generation fails - fallback strategies?

5. **Data Schema Implications:**
   - Do we need to modify our `jobs` table to track AI-generated vs. manual descriptions?
   - Should we store the context/prompts used for generation for future improvements?

6. **Implementation Approach:**
   - Given our Server Actions pattern, how should the client trigger the AI generation?
   - Where should the Inngest client be initialized in our project structure?
   - How do we handle API keys and environment variables for the LLM providers?

**Technical Constraints to Consider:**
- We must maintain the VSA structure - all job posting related code stays within the job posting route segments
- The solution should work with our existing Supabase auth and database setup
- We need to ensure the AI-generated content can be properly saved through our existing Server Actions

**Questions for Implementation:**
1. Should we create a new `_ai/` directory within the job posting route for AI-related utilities?
2. How do we want to structure the prompt templates - as separate files or inline?
3. What metadata about the generation process should we capture and store?

Please help me think through these considerations and propose a detailed technical approach that aligns with our project's architecture and conventions. Let's discuss the trade-offs and best practices before we start implementing.