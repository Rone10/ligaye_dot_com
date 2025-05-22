# VSA Flow Prompts

Category: Prompt
Status: Not started
Tags: Cursor, Nextjs

# Phase 0


Okay, let's create a workflow and prompts specifically for generating the "Initial Project Idea Description" and "Key Findings/Market Research Summary" that you need for **Step 1 ("Idea & Core Scope Definition")** of your main VSA planning workflow.

This preliminary stage is about clarifying your idea and gathering initial supporting evidence before you even start defining the Core Scope. We'll call this **"Phase 0: Idea Clarification & Research Synthesis."**

---

## Phase 0: Idea Clarification & Research Synthesis Workflow

**Goal:** To transform a raw idea into a clear, concise project idea description and a summary of key market findings/justifications, ready for input into the "Core Scope Definition" step.

**Tools:** Your AI assistant (like Cursor, potentially using its web browsing/research capabilities if available, or by you feeding it information you've gathered).

---


### Sub-Step 0.1: Raw Idea Brain Dump & Initial Problem Articulation



### Sub-Step 0.1: Raw Idea Brain Dump & Initial Problem Articulation

**Human Instructions:**

1.  Start with your raw, unrefined idea. Don't worry about structure yet.
2.  Copy the AI Prompt below.
3.  In the `<YOUR_RAW_IDEA_DUMP>` section, write down everything that comes to mind about your idea: what it is, who it might be for, what problems it might solve, any initial thoughts on features. Be as free-flowing as possible.
4.  Run the prompt. The AI will help you start structuring it and identify the core problem.
5.  Review the AI's output. Does it accurately capture the essence? Refine it with the AI if needed.

**AI Prompt (Sub-Step 0.1):**

You are a Product Brainstorming Assistant. I have a raw idea for a new project, and I need your help to start clarifying it, focusing on the core problem it aims to solve.

Here's my raw idea dump:
<YOUR_RAW_IDEA_DUMP>
(Example: "Maybe an app for Gambia for jobs. People struggle to find good jobs, companies can't find people. Needs to be easy to use, maybe with local payments. Not sure what features exactly yet, but a job board. Could help the economy. What about small businesses? Maybe an SMS alert feature because not everyone has constant internet.")

---

Based on my raw idea dump, please help me by:

1.  **Summarizing the Core Concept:** In 1-2 sentences, what is the fundamental idea or type of application being proposed?
2.  **Identifying Potential Core Problems Solved:** List 2-4 key problems that this idea seems to address for its potential users or the market. For each problem, briefly explain it.
3.  **Suggesting Key Questions for Further Clarification:** What are 2-3 important questions I should consider to refine this idea further?

Keep your response concise and focused on initial clarification.

---


### Sub-Step 0.2: Defining Target Users & Their Pains (Initial Pass)


### Sub-Step 0.2: Defining Target Users & Their Pains (Initial Pass)

**Human Instructions:**

1.  Take the output from Sub-Step 0.1 (especially the "Core Concept" and "Potential Core Problems Solved").
2.  Copy the AI Prompt below.
3.  Replace `<REFINED_CORE_CONCEPT_AND_PROBLEMS_FROM_0.1>` with the relevant output.
4.  Run the prompt. The AI will help you brainstorm initial user types and their specific pain points related to the problem.
5.  Review and refine the personas and pain points. Are these realistic?

**AI Prompt (Sub-Step 0.2):**

You are a User-Centered Design Thinker. Based on the refined core concept and identified problems below, help me brainstorm the primary target users and their specific pain points.

Refined Core Concept & Identified Problems:
<REFINED_CORE_CONCEPT_AND_PROBLEMS_FROM_0.1>
(Example: "Core Concept: A localized job board for Gambia connecting job seekers and employers. Problems Solved: Difficulty for job seekers to find relevant local opportunities; Challenge for employers to reach qualified local candidates; Lack of platforms supporting local payment methods; Information asymmetry in the job market.")

---

Please help me by:

1.  **Suggesting 2-3 Primary Target User Types/Personas:** For each user type, give a brief descriptive name (e.g., "Tech-Savvy Recent Graduate," "Small Business Owner Hiring Locally," "Experienced Professional Seeking New Role").
2.  **Listing Key Pain Points for Each User Type:** For each suggested user type, list 2-3 specific pain points they likely experience related to the core problems this project aims to solve. Be specific. (e.g., For "Tech-Savvy Recent Graduate": "Spends hours sifting through irrelevant international job boards," "Unsure which local companies are hiring for entry-level roles," "Difficult to showcase digital skills effectively on traditional CVs.")

Focus on initial user understanding.

---


### Sub-Step 0.3: Initial Market & Competitor Scan (Leveraging AI Research)


### Sub-Step 0.3: Initial Market & Competitor Scan (Leveraging AI Research)

**Human Instructions:**

1.  Take the outputs from Sub-Steps 0.1 and 0.2 (Core Concept, Problems, Target Users, Pains).
2.  Copy the AI Prompt below.
3.  Replace the placeholders with your refined information.
4.  **If your AI has web browsing capabilities (like Cursor often does, or if you're using Grok3/Perplexity separately):** Instruct it to perform a quick search.
5.  **If your AI does NOT have live web browsing:** You might need to do a quick manual search for existing solutions/competitors in your target market and provide that information within the prompt or as a follow-up.
6.  Run the prompt. The AI will help synthesize this into initial market observations.
7.  Review the output. This forms the basis of your "Key Findings/Market Research Summary."

**AI Prompt (Sub-Step 0.3):**

You are a Market Research Analyst. I need your help to perform an initial scan of the market and potential competition for the project idea detailed below.

Project Idea Context:
*   **Core Concept:** <YOUR_CORE_CONCEPT_FROM_0.1>
*   **Target Market (if specific):** <E.g., "Gambia">
*   **Primary Target Users & Their Key Pains:** <SUMMARY_OF_USERS_AND_PAINS_FROM_0.2>

---

[If AI has web browsing:]
Please perform a quick web search to help answer the following, focusing on the specified target market (if any).

[If AI does NOT have web browsing, or to supplement:]
Consider the information provided above and any general knowledge you have.

Then, based on your research/knowledge, please provide insights on:

1.  **Existing Solutions/Competitors (if any):**
    *   Are there direct competitors offering a similar solution in the target market? List 1-3 if found/known, with a brief note on what they offer.
    *   Are there indirect competitors or alternative ways users currently try to solve their pain points?
2.  **Potential Gaps or Opportunities:** Based on the user pains and existing solutions (or lack thereof), what are 1-2 potential gaps in the market that this project could fill? What makes this idea potentially unique or valuable in this context?
3.  **Key Market Considerations/Challenges:** What are 1-2 important factors or potential challenges to consider when entering this market with this idea (e.g., internet penetration, payment infrastructure, user tech-savviness, cultural factors if relevant)?

Focus on high-level observations for an initial market understanding.
---


### Sub-Step 0.4: Synthesizing into "Idea Description" & "Key Findings" for Step 1 Input


### Sub-Step 0.4: Synthesizing into "Idea Description" & "Key Findings" for Step 1 Input

**Human Instructions:**

1.  Gather all the refined outputs from Sub-Steps 0.1, 0.2, and 0.3.
2.  Copy the AI Prompt below.
3.  Carefully fill in the placeholders with your synthesized information.
4.  Run the prompt. The AI will now generate the two specific pieces of text you need for **Step 1 ("Idea & Core Scope Definition")** of your main workflow.
5.  **Critically review and edit** these outputs. Ensure they are concise, clear, and accurately reflect your vision and initial research. This is the official starting point for your project documentation.

**AI Prompt (Sub-Step 0.4):**

You are a Product Documentation Specialist. Your task is to synthesize the provided project clarification details into two specific outputs required for initiating a formal "Core Scope Document."

Synthesized Project Clarification Details:
*   **Finalized Core Concept:** <PASTE_FINALIZED_CORE_CONCEPT_FROM_EARLIER_STEPS>
*   **Key Problems Solved:** <LIST_KEY_PROBLEMS_FROM_EARLIER_STEPS_FROM_0.1> 
*   **Primary Target Users & Key Pains Summary:** <SUMMARIZE_USERS_AND_PAINS_FROM_EARLIER_STEPS>
*   **Initial Market & Competitor Observations (Gaps, Opportunities, Challenges):** <SUMMARIZE_MARKET_SCAN_OUTPUT_FROM_0.3>

---

Based *only* on the synthesized information provided above, generate the following two distinct sections:

**Section 1: Project Idea Description**
*   Format: A concise paragraph (3-5 sentences).
*   Content: Clearly state what the project is, its primary purpose/goal, who it's for (target users), and the main problem(s) it solves or value it delivers. This should be a polished, elevator-pitch style description.

**Section 2: Key Findings / Market Research Summary**
*   Format: A concise paragraph or 3-4 bullet points.
*   Content: Summarize the most important findings from the initial market scan. This should highlight why this project is needed or viable. Include:
    *   The primary market need or gap being addressed.
    *   A brief mention of the competitive landscape (e.g., "limited direct competition," "existing solutions lack X feature").
    *   Any key opportunities or unique selling points identified.
    *   Any critical market considerations or challenges noted.

Ensure both sections are clear, concise, and directly derived from the provided synthesized details. These outputs will be used as direct inputs for the next stage of project documentation.

---



By following this "Phase 0" workflow, you'll arrive at Step 1 of your main VSA planning process with a much clearer and more 
well-supported foundation, making the "Core Scope Definition" and subsequent steps more effective.


# ========= Phase 1 =========


Okay, let's break down each step of the VSA-aligned workflow and provide detailed prompts and instructions. Keep this document as your reference guide.

---

## VSA-Aligned Document Generation & Planning Workflow

This workflow guides you from an initial idea to a detailed, VSA-compliant implementation plan, ready for code generation using your AI assistant (like Cursor).

**Prerequisites:**

*   Your AI Assistant (e.g., Cursor) configured with:
    *   **Rule 1:** Content of your `base-knowledge.md` (Project architecture, VSA structure, conventions).
    *   **Rule 2:** Content of your `style-guide.md` (UI/styling conventions).
*   Your `feature-planner.md` *template* file (as refined previously, instructing the AI on *how* to structure the implementation plan).

---


## Step 1: Idea & Core Scope Definition (Lean)


### Step 1: Idea & Core Scope Definition (Lean)

**Goal:** Quickly establish the project's high-level purpose, users, and main feature areas. Create a concise document to guide subsequent steps.

**Human Instructions:**

1.  Gather your initial project idea description and the key findings from your market research (e.g., output from Grok3 or similar analysis).
2.  Copy the AI Prompt below into your AI assistant.
3.  Replace the placeholders `<YOUR_IDEA_DESCRIPTION>` and `<YOUR_MARKET_RESEARCH_SUMMARY>` with your specific information. Be clear and concise.
4.  Run the prompt.
5.  Review the generated "Core Scope Document". Ensure it accurately captures the essence of your project. Save this document – it's the input for Step 2.

**AI Prompt:**

You are a Product Analyst tasked with creating a concise Core Scope Document for a new web application project. Your goal is to quickly establish a shared understanding of the project's high-level direction.

Based on the provided Idea Description and Market Research Summary below, generate a Core Scope Document with the following sections:

1.  **Project Goal & Value Proposition:**
    *   A brief (1-2 sentence) statement defining the primary goal of the application.
    *   A clear (2-3 sentence) value proposition explaining the key benefit for users and how it differs from alternatives.

2.  **Target User Personas:**
    *   Briefly describe the primary types of users who will interact with the application (e.g., "Job Seeker," "Employer," "Admin"). Include 1-2 key needs or goals for each persona relevant to this application.

3.  **Key Epics / Feature Areas:**
    *   List the major functional areas or epics of the application (e.g., "User Authentication," "Job Posting & Management," "Job Search & Application," "Profile Management," "Payment Processing"). Keep this high-level.

**Constraints:**
*   Be concise and avoid excessive detail.
*   Focus on the *what*, not the *how*.
*   Do not include deep business model analysis (like BMC, SWOT) in *this* document.

--- START INPUTS ---

**Idea Description:**
<YOUR_IDEA_DESCRIPTION>
(Example: "A job board platform specifically for the Gambian market, connecting job seekers and employers with features tailored to local needs, including cash payment options.")

**Market Research Summary:**
<YOUR_MARKET_RESEARCH_SUMMARY>
(Example: "Research indicates a gap in Gambia for a modern, user-friendly job board. Key needs include localized job categories, mobile accessibility, and handling non-digital payments. Competition is limited/outdated. Target users are tech-savvy job seekers and local businesses.")

--- END INPUTS ---

Generate the Core Scope Document based *only* on the inputs provided above.

---


## Step 2: User Journey Mapping & App Flow -> Route Identification


### Step 2: User Journey Mapping & App Flow -> Route Identification

**Goal:** Define the primary user experiences and simultaneously map these flows to the fundamental Next.js App Router structure (`app/` directory routes).

**Human Instructions:**

1.  Take the "Core Scope Document" generated in Step 1.
2.  Copy the AI Prompt below into your AI assistant.
3.  Replace the placeholder `<CORE_SCOPE_DOCUMENT_FROM_STEP_1>` with the full text of the document you created in Step 1.
4.  Run the prompt.
5.  **Critically Review & Refine:** The AI will draft flows and suggest routes. Carefully review these:
    *   Do the journeys make sense for your users?
    *   Are the suggested Next.js routes logical? Do they follow RESTful/resource-oriented principles where applicable (e.g., `/jobs`, `/jobs/[slug]`, `/jobs/new`)?
    *   Adjust route names or structure as needed based on your architectural preferences and Next.js conventions. *You have the final say on the route structure.*
6.  Save the refined "App Flow Document". This document is the backbone for identifying VSA slices and will be heavily referenced in Step 3.

**AI Prompt:**

You are a UX Designer and Product Manager creating an App Flow Document for the web application defined in the Core Scope Document provided below.

Your primary goal is to map out the primary user journeys and simultaneously define the corresponding Next.js App Router route structure.

Based *only* on the Core Scope Document provided:

1.  **Draft User Journeys:** For each Target User Persona identified, outline the key steps they would take to accomplish their primary goals within the application (referencing the Key Epics/Feature Areas).
2.  **Define Screen Flows:** Translate these journeys into screen flows, describing the purpose of each key screen or view.
3.  **Map to Next.js Routes:** For each distinct screen or view identified in the screen flows, propose a corresponding Next.js App Router route segment. Use standard conventions (e.g., `/`, `/auth/login`, `/dashboard`, `/items`, `/items/[id]`, `/items/new`, `/settings/profile`). Clearly associate each screen/view with its proposed route.
4.  **Structure:** Organize the output clearly:
    *   Introduction/Purpose
    *   User Journeys (grouped by Persona)
    *   Screen Flows (describing purpose and associated Next.js Route)
    *   Optional: A simple text-based visualization of the main flows connecting the routes (e.g., `[Homepage /] -> [Login /auth/login] -> [Dashboard /dashboard]`).

**Constraints:**
*   Focus on the primary paths and key screens.
*   Ensure every significant view has a proposed route mapping.
*   Adhere to typical Next.js App Router routing conventions.

--- START INPUT: Core Scope Document ---

<CORE_SCOPE_DOCUMENT_FROM_STEP_1>

--- END INPUT: Core Scope Document ---

Generate the App Flow Document with integrated Next.js route mappings

---


## Step 3: Slice Requirements Definition


### Step 3: Slice Requirements Definition

**Goal:** Define the specific requirements for a *single* Vertical Slice (corresponding to one route segment identified in Step 2), preparing it for detailed planning.

**Human Instructions:**

1.  Identify the *specific route segment* (e.g., `/jobs/[slug]/apply`) you want to plan and build next.
2.  Open your "App Flow Document" (from Step 2) and locate the section(s) describing the screens, interactions, and user flow specifically related to that chosen route segment.
3.  Copy the AI Prompt below into your AI assistant.
4.  Replace the placeholder `<TARGET_ROUTE_SEGMENT>` with the exact route you are focusing on (e.g., `/jobs/[slug]/apply`).
5.  Replace the placeholder `<RELEVANT_APP_FLOW_SECTION_FOR_SLICE>` with the specific text copied from your App Flow document that details this route's functionality. Include enough context for the AI to understand the slice's purpose and interactions.
6.  Run the prompt.
7.  Review the generated "Slice Requirements". Does it accurately capture everything needed for this specific page/feature slice? Add any missing details or clarify ambiguities.
8.  Save these "Slice Requirements". This output is the direct input for Step 4.
9.  **Repeat this Step 3 process for each VSA slice** you plan to implement.

**AI Prompt:**

You are a Technical Product Manager defining the requirements for a specific Vertical Slice Architecture (VSA) slice within a Next.js application.

Your task is to generate a focused "Slice Requirements" document for the target route segment specified below, based *only* on the provided relevant section from the App Flow document.

Target Route Segment: `<TARGET_ROUTE_SEGMENT>`

Relevant App Flow Section:
<RELEVANT_APP_FLOW_SECTION_FOR_SLICE>
(Example for `/jobs/[slug]/apply`: Paste the text describing the navigation to this page, what's displayed, the form fields, interactions like resume/cover letter selection, submission process description, and success feedback from your App Flow doc.)

---

Generate the "Slice Requirements" document for the `<TARGET_ROUTE_SEGMENT>` slice, including the following sections:

1.  **Slice Goal:** A single sentence describing the primary purpose of this route/view.
2.  **Key Functional Requirements:** Bullet points detailing what the user must be able to *do* within this slice. Focus on actions and outcomes.
3.  **Data Requirements:**
    *   Data to be fetched on load (and potentially its source or key identifiers needed).
    *   Data to be displayed to the user.
    *   Data to be submitted or mutated by user actions within this slice (including destination, e.g., which table).
4.  **Key UI Elements / Interactions:** List the major UI components or patterns needed (e.g., Form, Data Table, Modal, Specific Input Types like File Upload, Rich Text Editor). Reference the project's UI library/style guide implicitly.
5.  **Non-Functional Considerations (Scoped):** Note any specific performance, security, validation rules (e.g., file types, required fields), or accessibility needs pertinent *only to this slice*.
6.  **Acceptance Criteria (Slice Level):** Write 2-4 high-level acceptance criteria in a "Given-When-Then" or similar structured format that define when this slice is considered complete from a functional perspective.

**Constraints:**
*   Focus *exclusively* on the provided `<TARGET_ROUTE_SEGMENT>` and its corresponding App Flow details.
*   Keep requirements technically focused but avoid deep implementation details (that's for the next step).
*   Ensure the requirements are sufficient to hand off for detailed technical planning.

---


## Step 4: Detailed VSA Implementation Planning


### Step 4: Detailed VSA Implementation Planning

**Goal:** Create a detailed, actionable technical plan for implementing the specific VSA slice, specifying file locations, code structures, data flow, etc., according to project conventions.

**Human Instructions:**

1.  Ensure your AI assistant (Cursor) has the `base-knowledge.md` and `style-guide.md` content loaded via Rules (or provide them as context).
2.  Have your `feature-planner.md` *template* file ready.
3.  Take the complete "Slice Requirements" document generated for your target slice in Step 3.
4.  Copy the AI Prompt below into your AI assistant.
5.  **Attach** the `feature-planner.md` template file to the prompt/chat.
6.  Replace the placeholder `<SLICE_REQUIREMENTS_FROM_STEP_3>` with the *full text* of the Slice Requirements document from Step 3.
7.  Run the prompt.
8.  Review the generated "Detailed Implementation Plan". Check for:
    *   Correct file paths within the target slice directory (`app/.../_components/`, `app/.../_actions.ts`, etc.).
    *   Adherence to VSA principles (colocation, correct placement of logic).
    *   Completeness based on the Slice Requirements.
    *   Correct use of conventions from `base-knowledge.md`.
9.  Save this plan. It's the direct input for Step 5 (Implementation).

**AI Prompt:**

Okay, let's generate the detailed implementation plan for a specific feature slice.

**Context:**
*   The project's `base-knowledge.md` (architecture, VSA, conventions) and `style-guide.md` (UI rules) are provided via pre-loaded context/Rules.
*   The attached `feature-planner.md` file defines your role and the required output structure for the implementation plan.

**Instructions:**
Act as the **Senior Software Architect** defined in the attached `feature-planner.md` template.

Generate the detailed technical implementation plan for the feature slice described in the "Slice Requirements" below.

**Strictly adhere to:**
1.  The VSA structure, conventions, and patterns defined in `base-knowledge.md`.
2.  The UI/styling guidelines from `style-guide.md`.
3.  The output format and detail level specified in the attached `feature-planner.md` template.

Base your plan *only* on the Slice Requirements provided below and the established project context (Rules).

--- START: Slice Requirements ---

<SLICE_REQUIREMENTS_FROM_STEP_3>
(Paste the complete output from Step 3 here)

--- END: Slice Requirements ---

Now, generate the detailed VSA implementation plan according to the `feature-planner.md` instructions.

*(**Attachment:** Ensure `feature-planner.md` template file is attached here)*

---


## Step 5: Implementation


### Step 5: Implementation

**Goal:** Generate the actual code for the VSA slice based on the detailed plan.

**Human Instructions:**

1.  Take the "Detailed Implementation Plan" generated in Step 4.
2.  Ensure your AI assistant (Cursor) still has the `base-knowledge.md` and `style-guide.md` context active (via Rules preferably).
3.  Copy the AI Prompt below into your AI assistant.
4.  Replace the placeholder `<DETAILED_IMPLEMENTATION_PLAN_FROM_STEP_4>` with the *full text* of the plan generated in Step 4.
5.  Run the prompt. The AI should generate the code for the specified files.
6.  **Review and Integrate:** Carefully review the generated code against the plan. Copy/paste the generated files/code snippets into your project at the correct locations specified in the plan.
7.  **Test:** Thoroughly test the implemented slice.

**AI Prompt:**

You are a Senior Software Engineer tasked with implementing a feature slice according to a detailed plan.

**Context:**
*   The project's `base-knowledge.md` (architecture, VSA, conventions) and `style-guide.md` (UI rules) are provided via pre-loaded context/Rules and MUST be strictly followed.

**Instructions:**
Implement the feature slice described in the "Detailed Implementation Plan" provided below.

*   Generate the complete code for **all new files** specified in the plan (e.g., `page.tsx`, `_components/*.tsx`, `_actions.ts`, `_queries.ts`, `_utils/*.ts`, etc.). Ensure code is placed in the **exact file paths** mentioned.
*   For modifications to existing files, clearly indicate the changes needed or provide the updated code block.
*   Strictly adhere to the function signatures, data structures, data flow, logic placement (UI in components, data access *only* in `_queries.ts`, business logic/validation in actions/_utils), component types (`'use client'`), imports, and conventions outlined in the plan and the base context.
*   Ensure generated code is clean, well-formatted, and includes necessary imports.

--- START: Detailed Implementation Plan ---

<DETAILED_IMPLEMENTATION_PLAN_FROM_STEP_4>
(Paste the complete output from Step 4 here)

--- END: Detailed Implementation Plan ---

Generate the code required to implement this feature slice according to the plan and project conventions.

---



By following these detailed steps and prompts, you should have a robust and repeatable process for planning and implementing features within your Next.js VSA project, moving efficiently from idea to code. Remember to always review the AI's output at each stage, especially for structural decisions like routing and VSA slice definition.


# =====================

# Notes

mention experience using this prompt eg how effective it is, does it work as expected, does it require refining or adaptation to certain constraints etc