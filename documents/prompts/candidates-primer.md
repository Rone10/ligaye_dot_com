This Job Board Platform for Gambia is a web-based solution designed to connect job seekers and employers in the Gambian market.
I have already implemented much of the functionalities of the employer features. Here I want you to focus on implementing the candidates (job seekers) features. Currently we have mock data. We are going to replace it with real data using the database. 

## knowledge base for implementing candidate features
## Candidate Features Overview

The candidate (job seeker) features allow users to create profiles, search for jobs, apply to positions, save favorite jobs, and manage their applications. These features need to be implemented using our existing tech stack and database schema.

## Tech Stack for Candidate Features

- **Frontend**: Next.js 15 App Router, React, TypeScript
- **UI Components**: Shadcn UI, Radix UI, Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Query for server state, Context API for global state
- **URL State Management**: nuqs for URL search parameters
- **Date Handling**: date-fns

## Database Schema

## Database Schema

We are using Drizzle ORM with PostgreSQL for our database, leveraging its type inference capabilities for type safety. You can find the schema in lib/db/schema.ts


## Key Files and Directories

### Server Actions
- `/app/actions/candidate/profile.ts` - Manage candidate profile data
- `/app/actions/candidate/applications.ts` - Handle job applications
- `/app/actions/candidate/saved-jobs.ts` - Manage saved jobs


### Database Queries
- `/lib/db/queries/candidates.ts` - Database operations for candidates
- `/lib/db/queries/applications.ts` - Database operations for applications
- `/lib/db/queries/saved-jobs.ts` - Database operations for saved jobs

### Pages and Components
- `/app/(dashboard)/candidate/dashboard/page.tsx` - Candidate dashboard
- `/app/(dashboard)/candidate/applications/page.tsx` - Applications management
- `/app/(dashboard)/candidate/profile/page.tsx` - Candidate profile
- `/app/(dashboard)/candidate/saved-jobs/page.tsx` - Saved jobs list


### Components
- `/components/candidate/profile-form.tsx` - Profile creation/editing form
- `/components/candidate/resume-builder.tsx` - Resume building interface
- `/components/candidate/application-card.tsx` - Application display card
- `/components/candidate/job-card.tsx` - Job listing card

## Implementation Requirements


3. **Job Applications**
   - Apply to jobs with optional cover letter
   - Track application status
   - View application history

4. **Saved Jobs**
   - Save jobs for later viewing
   - Remove jobs from saved list
   - Get notifications for saved job updates

5. **Dashboard**
   - Overview of recent applications
   - Application status updates
   - Profile completion percentage

## API Endpoints

The application uses server actions instead of traditional API endpoints. Key server actions include:


- `updateCandidateProfile` - Update an existing profile
- `fetchCandidateProfile` - Get candidate profile data
- `searchJobs` - Search for jobs with filters
- `applyToJob` - Submit a job application
- `fetchApplications` - Get a candidate's applications
- `saveJob` - Save a job for later
- `removeSavedJob` - Remove a job from saved list
- `fetchSavedJobs` - Get a candidate's saved jobs

## Authentication and Authorization

- Use Supabase authentication for user management:
   - Use this import to access current logged in user: `import { getUser } from '@/lib/supabase/server';`
- Secure server actions with proper authentication checks

## Important Utilities

- `/lib/utils.ts` - Common utility functions
- `/lib/supabase/server.ts` - Server-side Supabase client
- `/lib/db/schema.ts` - Database schema definitions and types
- `/lib/validators/candidate.ts` - Validation schemas for candidate data

## Example Implementation Pattern

For implementing candidate features, follow this pattern:

1. Define database queries in the appropriate query file
2. Create server actions that use these queries
3. Build UI components that call these server actions
4. Implement pages that use these components
5. Add proper error handling and loading states
6. Ensure responsive design for all screen sizes


## File Structure
- app
  - (auth)
    - layout.tsx
    - reset-password
      - page.tsx
    - sign-in
      - page.tsx
    - sign-up
      - page.tsx
    - update-password
      - page.tsx
    - verify
      - page.tsx
      - verify-email.tsx
  - (dashboard)
    - candidate
      - _components
      - applications
      - dashboard
      - profile
      - saved-jobs
    - employer
      - applicants
      - company
      - dashboard
      - jobs
      - settings
      - tenders
    - layout.tsx
  - (root)
    - about
      - page.tsx
    - blogs
      - id
      - page.tsx
    - contact
      - page.tsx
    - jobs
      - [id]
      - page.tsx
    - layout.tsx
    - page.tsx
    - tenders
      - [id]
      - page.tsx
  - actions
    - candidate
      - applications.ts
      - dashboard.ts
      - profile.ts
      - saved-jobs.ts
    - employer
      - applicant-filters.ts
      - applicants.ts
      - company.ts
      - dashboard.ts
      - job-filters.ts
      - jobs.ts
      - locations.ts
      - new_jobs.ts
    - jobs.ts
    - profile.ts
    - tenders.ts
  - components
    - filters.tsx
    - footer.tsx
    - header.tsx
    - job-card.tsx
    - jobs
      - company-info.tsx
      - job-description.tsx
      - job-details-sidebar.tsx
      - job-header.tsx
      - similar-jobs.tsx
    - search-section.tsx
    - sidebar
      - sidebar-item.tsx
      - sidebar.tsx
      - user-info.tsx
  - create-profile
    - _components
      - BasicProfileForm.tsx
      - CandidateProfileForm.tsx
      - EmployerProfileForm.tsx
      - ProfileCreationForm.tsx
    - page.tsx
  - globals.css
  - layout.tsx
  - lib
    - validations
      - search.ts
  - types
    - blog.ts
    - index.ts
    - tender.ts
- components
  - auth
    - auth-form.tsx
  - blocks
    - hero-with-mockup.tsx
  - tiptap-editor.tsx
  - ui
    - accordion.tsx
    - alert-dialog.tsx
    - alert.tsx
    - aspect-ratio.tsx
    - avatar.tsx
    - badge.tsx
    - breadcrumb.tsx
    - button.tsx
    - calendar.tsx
    - card.tsx
    - carousel.tsx
    - chart.tsx
    - checkbox.tsx
    - collapsible.tsx
    - command.tsx
    - context-menu.tsx
    - date-picker.tsx
    - dialog.tsx
    - drawer.tsx
    - dropdown-menu.tsx
    - form.tsx
    - glow.tsx
    - hover-card.tsx
    - icons.tsx
    - input-otp.tsx
    - input.tsx
    - label.tsx
    - menubar.tsx
    - mockup.tsx
    - navigation-menu.tsx
    - pagination.tsx
    - popover.tsx
    - progress.tsx
    - radio-group.tsx
    - resizable.tsx
    - scroll-area.tsx
    - select.tsx
    - separator.tsx
    - sheet.tsx
    - sidebar.tsx
    - skeleton.tsx
    - slider.tsx
    - sonner.tsx
    - switch.tsx
    - table.tsx
    - tabs.tsx
    - textarea.tsx
    - theme-provider.tsx
    - toast.tsx
    - toaster.tsx
    - toggle-group.tsx
    - toggle.tsx
    - tooltip.tsx
- components.json
- drizzle
  - 0000_open_unus.sql
  - 0001_heavy_golden_guardian.sql
  - meta
    - 0000_snapshot.json
    - 0001_snapshot.json
    - _journal.json
- drizzle.config.ts
- hooks
  - use-mobile.tsx
  - use-toast.ts

- lib
  - constants.ts
  - db
    - db.ts
    - queries
      - candidates
      - employer
      - profiles.ts
    - rls_policies.sql
    - schema.ts
  - supabase
    - client.ts
    - server.ts
  - utils.ts
- middleware.ts
- next-env.d.ts
- next.config.js
- package.json
- pnpm-lock.yaml
- postcss.config.js
- tailwind.config.ts
- tailwind.config.ts.bak
- tsconfig.json



## Implementation Notes
- The correct way to import the db instance module is: `import { db } from '@/lib/db/db';`
    - this instance should always be awaited before use, example:
```typescript
    // Get user profile
  const userProfile = await db()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
```
- always use pnpm as the package manager
- all Shadcn UI components have been installed in `components/ui`
- the database has been properly configured and works perfectly, do not alter it
- the current logged in user can be accessed through the `getUser()` function imported from `import { getUser } from '@/lib/supabase/server';`
- always access the schema tables using drizzle orm instead of supabase
- always use the drizzle infered types from `lib/db/schema.ts`