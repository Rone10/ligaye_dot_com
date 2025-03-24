## App Purpose and Main Features
This Job Board Platform for Gambia is a web-based solution designed to connect job seekers and employers in the Gambian market.
I have already implemented much of the functionalities of the employer features. Here I want you to focus on implementing the candidates (job seekers) features. Currently we have mock data. We are going to replace it with real data using the database. 

## Tech Stack Overview
- **Frontend**:
  - **Next.js 15 (App Router)**: Handles routing, server-side rendering, and static site generation.
  - **React**: Core library for building user interfaces.
  - **TypeScript**: Adds type safety and improves developer experience.
- **Backend**:
  - **Supabase**: Provides authentication, PostgreSQL database, and real-time subscriptions.
  - **Drizzle ORM**: Manages database schema and queries with a lightweight ORM.
  - **Zod**: Ensures runtime schema validation for data integrity.
- **UI and Styling**:
  - **Shadcn UI**: Reusable, customizable component library.
  - **Tailwind CSS**: Utility-first CSS framework for rapid styling.
- **Animation**:
  - **Framer Motion**: Powers smooth animations and transitions.
- **Icons**:
  - **Lucide React**: Lightweight, customizable icon library.
- **State Management**:
  - **React Query**: Manages server-side state, caching, and data fetching.
  - **Context API**: Handles global client-side state (e.g., user session).
- **URL State Management**:
  - **nuqs**: Simplifies URL search parameter management.
- **Date Handling**:
  - **date-fns**: Lightweight library for date manipulation and formatting.
- **Package Manager**:
  - **pnpm**: Efficient, fast dependency management.

## Project Structure
The project follows a modular structure organized by feature and responsibility:

- **app**: Core application code using Next.js App Router
  - **(auth)**: Authentication-related pages and components
  - **(dashboard)**: Protected routes for authenticated users
    - **candidate**: Job seeker features (applications, profile, saved jobs)
    - **employer**: Employer features (job posting, applicant management)
  - **(root)**: Public-facing pages (home, jobs, about, contact)
  - **actions**: Server actions for data mutations
    - **candidate**: Job seeker-specific actions
    - **employer**: Employer-specific actions
  - **components**: Shared UI components for the application
  - **create-profile**: Profile creation flow components and pages
  - **lib**: Utility functions and validation schemas

- **components**: Reusable UI components
  - **auth**: Authentication-related components
  - **blocks**: Larger composed UI sections
  - **ui**: Shadcn UI component library

- **drizzle**: Database migration files and metadata

- **hooks**: Custom React hooks for shared functionality

- **lib**: Core utilities and services
  - **db**: Database connection, schema definitions, and queries
  - **supabase**: Supabase client configuration
  - **utils**: Helper functions and utilities

- **public**: Static assets (images, fonts, etc.)


## Database Schema
The database schema consists of the following tables:

1. **profiles** - Base user information for all users, linked to Supabase Auth.

2. **employerProfiles** - Extended information for users with the employer role.

3. **candidateProfiles** - Extended information for users with the candidate role.

4. **locations** - Geographic location data structured for The Gambia.

5. **jobs** - Job listings with detailed information about positions.

6. **applications** - Job applications submitted by candidates.

7. **savedJobs** - Jobs bookmarked by users for later reference.

8. **tenders** - Tender and public notice listings.

9. **skills** - Reusable skill definitions for jobs and candidates.

10. **jobSkills** - Junction table connecting jobs to required skills.

11. **candidateSkills** - Junction table connecting candidates to their skills.

12. **industries** - Reusable industry categories.

13. **jobIndustries** - Junction table connecting jobs to relevant industries.


## Implementation Notes
- We are using server actions and db queries for all database interactions. We are not using API routes.
- All database interactions happen at the data layer in `lib/db/queries`.
- The correct way to import the db instance module is: `import { db } from '@/lib/db/db';`
    - this `db` instance should always be awaited before use, example: `await db()`
- the current logged in user can be accessed through the `getUser()` function imported from `import { getUser } from '@/lib/supabase/server';`
- always use the drizzle infered types from `lib/db/schema.ts`
- always access the schema tables using drizzle orm instead of supabase
- the database has been properly configured and works perfectly, do not alter it
- always use pnpm as the package manager
- **all** Shadcn UI components have been installed in `components/ui`
