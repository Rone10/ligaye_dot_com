
# Feature Implementation: Blog Platform

**Project Context:** Ligaye.com (Job & Tender Board for Gambia)
**Core Technologies:** Next.js 15 (App Router), Supabase (Auth, DB, Storage), Drizzle ORM, Tailwind CSS, Shadcn UI.
**Existing Component:** Rich Text Editor at `app/components/RichTextEditor/editor.tsx`.
**Architectural Pattern:** Granular Vertical Slice Architecture (VSA) within `app/` route segments.

**Objective:**
Implement a simple blog feature where users with the 'admin' role can create, manage, and publish articles. Published articles will be publicly viewable. The blog will not have a comments section.

---

## 1. Database Schema Modifications (`lib/db/schema.ts`)

You will need to add one new table for blog posts.

**a. New Table: `blogPosts`**
   - Stores blog articles and their metadata.

   ```typescript
   // In lib/db/schema.ts

   // ... other imports
   import { profiles, userRoleEnum } from './schema'; // Ensure profiles is defined/imported

   export const blogPostStatusEnum = pgEnum('blog_post_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED']);

   export const blogPosts = pgTable('blog_posts', {
     id: uuid('id').primaryKey().defaultRandom(),
     title: text('title').notNull(),
     slug: text('slug').notNull().unique(), // For SEO-friendly URLs
     content: text('content').notNull(), // HTML content from Rich Text Editor
     excerpt: text('excerpt'), // Optional short summary for list views
     featuredImageUrl: text('featured_image_url'), // URL to Supabase Storage (publicly accessible or signed)
     status: blogPostStatusEnum('status').default('DRAFT').notNull(),
     authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'set null' }), // Link to the admin profile who wrote it
     publishedAt: timestamp('published_at'), // Set when status changes to 'PUBLISHED'
     deleted: boolean('deleted').default(false).notNull(), // Standard soft delete
     createdAt: timestamp('created_at').notNull().defaultNow(),
     updatedAt: timestamp('updated_at').notNull().defaultNow(),
   }, (table) => {
     return {
       slugIdx: index('blog_posts_slug_idx').on(table.slug),
       statusIdx: index('blog_posts_status_idx').on(table.status),
       authorIdIdx: index('blog_posts_author_id_idx').on(table.authorId),
       publishedAtIdx: index('blog_posts_published_at_idx').on(table.publishedAt),
       deletedIdx: index('blog_posts_deleted_idx').on(table.deleted),
     };
   });
   ```

**b. Define Drizzle Relations:**

   ```typescript
   // In lib/db/schema.ts, within the relations definitions:

   // For blogPosts
   export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
     author: one(profiles, {
       fields: [blogPosts.authorId],
       references: [profiles.id],
       relationName: 'blogPostAuthor'
     }),
   }));

   // In profilesRelations (add this to the existing profilesRelations)
   // export const profilesRelations = relations(profiles, ({ one, many }) => ({
   //   ... existing relations
        authoredBlogPosts: many(blogPosts, { relationName: 'blogPostAuthor' }),
   // }));
   ```

**c. Generate and Apply Migrations:**
   - After schema changes, run `pnpm drizzle-kit generate:pg` and then apply the migration.

---

## 2. Supabase Storage & RLS

**a. Create Storage Bucket for Featured Images:**
   - Name: `blog-images`
   - **Set to Public.** This simplifies displaying images on the public blog. RLS will control uploads.
   - **RLS for `blog-images` bucket (Uploads):**
     ```sql
     -- Allow admin users to upload to the blog-images bucket
     CREATE POLICY "Admin users can upload blog images"
     ON storage.objects FOR INSERT
     TO authenticated
     WITH CHECK (
       bucket_id = 'blog-images' AND
       auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin') -- Check against profiles.userId which links to auth.uid()
     );

     -- Allow public read access to blog-images (if bucket is public, this is often default, but explicit is good)
     CREATE POLICY "Public can read blog images"
     ON storage.objects FOR SELECT
     USING ( bucket_id = 'blog-images' );
     ```

**b. RLS Policies for `blogPosts` Table:**
   - **SELECT:**
     ```sql
     -- Allow public read for PUBLISHED and not deleted posts
     CREATE POLICY "Public can read published blog posts"
     ON public.blog_posts FOR SELECT
     USING (status = 'PUBLISHED' AND deleted = false);

     -- Allow admin users to read all blog posts
     CREATE POLICY "Admins can read all blog posts"
     ON public.blog_posts FOR SELECT
     TO authenticated
     USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin'));
     ```
   - **INSERT:**
     ```sql
     CREATE POLICY "Admins can create blog posts"
     ON public.blog_posts FOR INSERT
     TO authenticated
     WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin'));
     ```
   - **UPDATE:**
     ```sql
     CREATE POLICY "Admins can update blog posts"
     ON public.blog_posts FOR UPDATE
     TO authenticated
     USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin'))
     WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE role = 'admin'));
     ```
   - **DELETE (Soft Deletes via UPDATE):** The UPDATE policy above covers setting `deleted = true` if admins perform this. True row-level DELETEs can be restricted similarly if needed.

---

## 3. Admin Panel for Blog Management (VSA)

Create new route segments under an blog path (e.g., `/(public)/blog/...`).

**a. List Blog Posts (`app/(public)/blog/page.tsx`):**
   - Displays a table of all blog posts (drafts, published, archived) for admins.
   - Columns: Title, Status, Author, Published At, Created At, Actions (Edit, Delete).
   - Link/Button to "Create New Post".
   - **`_queries.ts`:** `getAllBlogPostsForAdmin()` (fetches posts with author's full name).
   - **`_components/AdminBlogPostsTable.tsx`:** Renders the table and action buttons.

**b. Create New Blog Post (`app/(public)/blog/new/page.tsx`):**
   - Form for creating a new blog post.
   - **`_components/BlogPostForm.tsx` (`'use client'`):**
     *   Input for `title`.
     *   Input for `slug` (can be auto-suggested from title client-side using a slugify utility, but ultimately set/validated server-side).
     *   The existing `app/components/RichTextEditor/editor.tsx` for `content`.
     *   Textarea for `excerpt` (optional).
     *   File input for `featuredImageUrl`.
     *   Select dropdown for `status` (Draft, Published).
     *   Submit button.
   - **`_actions.ts` (`createBlogPostAction`):**
     *   **Admin Check:** Verify current user is an admin using `await getUser()`.
     *   Validate form data (Zod).
     *   If `featuredImageUrl` is provided, upload it to `blog-images` bucket in Supabase Storage (use server-side Supabase client with service_role key). Get the public URL.
     *   Generate/finalize `slug` (ensure uniqueness).
     *   If `status` is 'PUBLISHED' and `publishedAt` is not set, set `publishedAt = new Date()`.
     *   Fetch `profile.id` of the admin user to use as `authorId`.
     *   Insert data into `blogPosts` table.
     *   `revalidatePath('/blog')` and `revalidatePath('/admin/blog')`. Redirect to admin blog list or the new post's edit page.
   - **`_queries.ts`:** `insertBlogPost(...)`, `getProfileIdFromAuthUserId(...)`.
   - **`_utils/slugify.ts`:** A simple utility to generate slugs from titles.

**c. Edit Blog Post (`app/(public)/blog/[postId]/edit/page.tsx`):**
   - Pre-filled form for editing an existing blog post.
   - **`_queries.ts`:** `getBlogPostByIdForEdit(postId)` (fetches post data).
   - **`_components/BlogPostForm.tsx`:** Reused, pre-filled with fetched data.
   - **`_actions.ts` (`updateBlogPostAction`):**
     *   Admin Check.
     *   Validate form data.
     *   Handle `featuredImageUrl` update (upload new, delete old from storage if replaced).
     *   Update `slug` if title changed and admin wants to update slug (handle uniqueness).
     *   If `status` changes to 'PUBLISHED' and `publishedAt` was null, set `publishedAt = new Date()`. If status changes away from 'PUBLISHED', `publishedAt` could be nulled or kept as historical.
     *   Update data in `blogPosts` table.
     *   `revalidatePath('/blog')`, `revalidatePath('/blog/[slug]')`, `revalidatePath('/admin/blog')`. Redirect.
   - **`_queries.ts`:** `updateBlogPost(...)`.

**d. Delete Blog Post (Soft Delete in `_actions.ts` for AdminBlogPostsTable):**
   - An action (e.g., `deleteBlogPostAction(postId)`) that sets `deleted = true` and `status = 'ARCHIVED'` (or just `deleted = true`) for the specified post.
   - Admin Check.
   - `revalidatePath`.

---

## 4. Public Blog Viewing (VSA)

Create new route segments for public access.

**a. Blog Listing Page (`app/blog/page.tsx`):**
   - Displays a list/grid of published blog posts, newest first.
   - Pagination should be implemented.
   - **`_queries.ts`:** `getPublishedBlogPosts({ page, limit })` (fetches non-deleted, `status = 'PUBLISHED'` posts, ordered by `publishedAt DESC`, with author's full name).
   - **`_components/BlogPostCard.tsx`:** Displays individual post preview (featured image, title, excerpt, author name, published date). Links to the full post page using the `slug`.

**b. Single Blog Post Page (`app/blog/[slug]/page.tsx`):**
   - Displays the full content of a single published blog post.
   - **`_queries.ts`:** `getPublishedBlogPostBySlug(slug)` (fetches one non-deleted, `status = 'PUBLISHED'` post by its unique slug, with author's full name).
   - If no post found for slug, use `notFound()` from `next/navigation`.
   - **Component structure:**
     *   Display `title`.
     *   Display `featuredImageUrl` (if present).
     *   Display author name and `publishedAt` date.
     *   Render `content` (HTML from Rich Text Editor). **Important:** Ensure this HTML is rendered safely. If the editor guarantees safe HTML, `dangerouslySetInnerHTML` can be used. Otherwise, server-side sanitization (e.g., with DOMPurify) is recommended before saving or on display.
   - Set appropriate `<title>` and meta tags for SEO.

---

## 5. Type Definitions (`lib/db/schema.ts`)

Ensure you add `InferSelectModel` and `InferInsertModel` types for the new table:
```typescript
// In lib/db/schema.ts, at the end

export type BlogPost = InferSelectModel<typeof blogPosts>;
export type NewBlogPost = InferInsertModel<typeof blogPosts>;
// Export the enum type if needed elsewhere
export type BlogPostStatus = (typeof blogPostStatusEnum.enumValues)[number];
```

---

## 6. Key Files to Create/Modify (Illustrative List)

*   `lib/db/schema.ts` (Schema, Enum, Relations, Types)
*   `app/(public)/blog/page.tsx` (Admin list view)
*   `app/(public)/blog/_components/AdminBlogPostsTable.tsx`
*   `app/(public)/blog/_queries.ts` (Admin data fetching)
*   `app/(public)/blog/_actions.ts` (Admin delete action)
*   `app/(public)/blog/new/page.tsx` (Admin create form view)
*   `app/(public)/blog/new/_components/BlogPostForm.tsx` (Shared form component)
*   `app/(public)/blog/new/_actions.ts` (Create action)
*   `app/(public)/blog/new/_queries.ts` (Create DB logic)
*   `app/(public)/blog/new/_utils/slugify.ts` (or in `lib/utils.ts` if generic)
*   `app/(public)/blog/[postId]/edit/page.tsx` (Admin edit form view)
*   `app/(public)/blog/[postId]/edit/_actions.ts` (Update action)
*   `app/(public)/blog/[postId]/edit/_queries.ts` (Update DB logic, fetch for edit)
*   `app/blog/page.tsx` (Public list view)
*   `app/blog/_components/BlogPostCard.tsx`
*   `app/blog/_queries.ts` (Public data fetching for list)
*   `app/blog/[slug]/page.tsx` (Public single post view)
*   `app/blog/[slug]/_queries.ts` (Public data fetching for single post)

---

## Reminders:

*   **VSA:** Adhere strictly to placing components, actions, queries, utils, etc., within their respective feature route segments.
*   **Admin Authorization:** All admin-related Server Actions and data queries must verify the user's 'admin' role.
*   **Slug Uniqueness:** Ensure slugs are unique. The `unique()` constraint in the schema helps, but your application logic should handle potential conflicts gracefully (e.g., appending a number if a generated slug already exists).
*   **Content Safety:** Be mindful of XSS risks when rendering HTML content from the Rich Text Editor. If the editor's output is not guaranteed to be safe, implement server-side sanitization.
*   **Image Handling:** Manage uploads securely. Optimize images if possible. Provide alt text fields for accessibility.
*   **User Experience:** Clear navigation for admins, and an easy-to-read public blog interface.
*   **Revalidation:** Use `revalidatePath` or `revalidateTag` appropriately after mutations to ensure fresh data is shown.

This plan provides a solid foundation for the blog feature.
```