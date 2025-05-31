# Blog Feature Implementation Plan

**Project:** Ligaye.com Blog Platform  
**Status:** Database Schema & RLS ✅ Completed  
**Next Steps:** Admin Panel & Public Views Implementation

---

## Overview

This plan outlines the implementation of a blog feature for Ligaye.com following the Vertical Slice Architecture (VSA) pattern. The implementation is divided into two main areas:

1. **Admin Management Routes** (`app/(admin)admin/blog/*`) - For admin users to manage blog posts
2. **Public Blog Routes** (`app/(public)/blog/*`) - For public viewing of published blog posts

---

## Phase 1: Admin Panel Implementation

### 1.1 Admin Blog List View
**Route:** `app/(admin)admin/blog/page.tsx`

**Implementation Steps:**

1. **Create the main page component**
   - Server Component that fetches all blog posts for admin users
   - Implements admin role verification using `getUser()` from `@/lib/supabase/server`
   - Displays "Access Denied" for non-admin users

2. **Create `_queries.ts`**
   ```typescript
   // Functions to implement:
   - getAllBlogPostsForAdmin(): Promise<BlogPostWithAuthor[]>
   - getProfileIdFromAuthUserId(userId: string): Promise<string | null>
   ```

3. **Create `_components/AdminBlogPostsTable.tsx`**
   - Client Component (`'use client'`)
   - Uses Shadcn UI Table components
   - Columns: Title, Status, Author, Published At, Created At, Actions
   - Action buttons: Edit, Delete (with confirmation)
   - "Create New Post" button linking to `/blog/new`

4. **Create `_actions.ts`**
   ```typescript
   // Functions to implement:
   - deleteBlogPostAction(postId: string): Promise<{success: boolean, error?: string}>
   ```

**Files to Create:**
- `app/(admin)admin/blog/page.tsx`
- `app/(admin)admin/blog/_queries.ts`
- `app/(admin)admin/blog/_components/AdminBlogPostsTable.tsx`
- `app/(admin)admin/blog/_actions.ts`

### 1.2 Create New Blog Post
**Route:** `app/(admin)admin/blog/new/page.tsx`

**Implementation Steps:**

1. **Create the new post page**
   - Server Component with admin role verification
   - Renders the BlogPostForm component

2. **Create `_components/BlogPostForm.tsx`**
   - Client Component (`'use client'`)
   - Uses React Hook Form with Zod validation
   - Form fields:
     - Title (text input)
     - Slug (auto-generated from title, editable)
     - Content (Rich Text Editor from `app/components/RichTextEditor/editor.tsx`)
     - Excerpt (textarea, optional)
     - Featured Image (file upload)
     - Status (select: Draft/Published)
   - Real-time slug generation from title
   - Image preview functionality

3. **Create `_actions.ts`**
   ```typescript
   // Functions to implement:
   - createBlogPostAction(formData: FormData): Promise<{success: boolean, error?: string, postId?: string}>
   ```

4. **Create `_queries.ts`**
   ```typescript
   // Functions to implement:
   - insertBlogPost(data: NewBlogPost): Promise<string> // Returns new post ID
   - checkSlugUniqueness(slug: string, excludeId?: string): Promise<boolean>
   ```

5. **Create `_utils/slugify.ts`**
   ```typescript
   // Functions to implement:
   - generateSlug(title: string): string
   - ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string>
   ```

**Files to Create:**
- `app/(admin)admin/blog/new/page.tsx`
- `app/(admin)admin/blog/new/_components/BlogPostForm.tsx`
- `app/(admin)admin/blog/new/_actions.ts`
- `app/(admin)admin/blog/new/_queries.ts`
- `app/(admin)admin/blog/new/_utils/slugify.ts`

### 1.3 Edit Blog Post
**Route:** `app/(admin)admin/blog/[postId]/edit/page.tsx`

**Implementation Steps:**

1. **Create the edit page**
   - Server Component with admin verification
   - Fetches existing blog post data
   - Handles 404 for non-existent posts

2. **Create `_queries.ts`**
   ```typescript
   // Functions to implement:
   - getBlogPostByIdForEdit(postId: string): Promise<BlogPost | null>
   - updateBlogPost(postId: string, data: Partial<BlogPost>): Promise<void>
   ```

3. **Create `_actions.ts`**
   ```typescript
   // Functions to implement:
   - updateBlogPostAction(postId: string, formData: FormData): Promise<{success: boolean, error?: string}>
   ```

4. **Reuse components**
   - Reuse `BlogPostForm.tsx` from new route with pre-filled data
   - Handle image replacement logic

**Files to Create:**
- `app/(admin)admin/blog/[postId]/edit/page.tsx`
- `app/(admin)admin/blog/[postId]/edit/_queries.ts`
- `app/(admin)admin/blog/[postId]/edit/_actions.ts`

---

## Phase 2: Public Blog Implementation

### 2.1 Public Blog Listing
**Route:** `app/(public)/blog/page.tsx`

**Implementation Steps:**

1. **Create the public blog listing page**
   - Server Component (no auth required)
   - Implements pagination using URL search params with `nuqs`
   - SEO-optimized with proper meta tags

2. **Create `_queries.ts`**
   ```typescript
   // Functions to implement:
   - getPublishedBlogPosts(params: {page: number, limit: number}): Promise<{posts: BlogPostWithAuthor[], totalCount: number}>
   ```

3. **Create `_components/BlogPostCard.tsx`**
   - Displays post preview with:
     - Featured image (with fallback)
     - Title
     - Excerpt
     - Author name
     - Published date
     - Read more link using slug
   - Uses style-guide.md design patterns (glass-card, proper spacing)

4. **Create `_components/BlogPagination.tsx`**
   - Pagination component using Shadcn UI
   - URL-based state management with `nuqs`

**Files to Create:**
- `app/(public)/blog/page.tsx`
- `app/(public)/blog/_queries.ts`
- `app/(public)/blog/_components/BlogPostCard.tsx`
- `app/(public)/blog/_components/BlogPagination.tsx`

### 2.2 Single Blog Post View
**Route:** `app/(public)/blog/[slug]/page.tsx`

**Implementation Steps:**

1. **Create the single post page**
   - Server Component with SEO optimization
   - Dynamic meta tags based on post content
   - Handles 404 for non-existent slugs using `notFound()`

2. **Create `_queries.ts`**
   ```typescript
   // Functions to implement:
   - getPublishedBlogPostBySlug(slug: string): Promise<BlogPostWithAuthor | null>
   ```

3. **Create post display component**
   - Clean, readable layout
   - Featured image display
   - Author information
   - Published date
   - Safe HTML content rendering
   - Social sharing buttons (optional)

**Files to Create:**
- `app/(public)/blog/[slug]/page.tsx`
- `app/(public)/blog/[slug]/_queries.ts`
- `app/(public)/blog/[slug]/_components/BlogPostContent.tsx`

---

## Phase 3: Shared Utilities & Types

### 3.1 Type Definitions
**Note:** Already implemented in `lib/db/schema.ts`
- `BlogPost` type
- `NewBlogPost` type  
- `BlogPostStatus` enum type

### 3.2 Extended Types
**File:** `lib/types/blog.ts` (if needed)
```typescript
// Additional types that might be needed:
- BlogPostWithAuthor (includes author profile data)
- BlogPostFormData (for form validation)
- BlogListParams (for pagination/filtering)
```

### 3.3 Validation Schemas
**File:** `lib/validations/blog.ts`
```typescript
// Zod schemas for:
- createBlogPostSchema
- updateBlogPostSchema  
- blogPostQuerySchema
```

---

## Phase 4: Navigation & Integration

### 4.1 Navigation Updates
1. **Add blog links to main navigation** (if applicable)
2. **Admin dashboard link** to blog management
3. **Breadcrumb navigation** for blog routes

### 4.2 Error Handling
1. **Error boundaries** for blog routes
2. **Loading states** for all async operations
3. **Toast notifications** for admin actions

### 4.3 SEO Optimization
1. **Dynamic meta tags** for blog posts
2. **Open Graph tags** for social sharing
3. **Structured data** for search engines
4. **XML sitemap** updates to include blog posts

---

## Implementation Guidelines

## User Role Check
1. **Admin role:** use `user.user_metadata.role !== 'admin'` when checking for admin role
```typescript
  const user = await getUser();
  
  if (!user || user?.user_metadata?.role !== 'admin') {
    redirect('/not-found');
  }
```

### Security Considerations
1. **Admin role verification** in all admin routes and actions
2. **Input sanitization** for blog content
3. **File upload validation** for featured images
4. **CSRF protection** via Next.js built-in mechanisms

### Performance Optimization
1. **Image optimization** using Next.js Image component
2. **Pagination** for large blog lists
3. **Proper caching** with revalidatePath/revalidateTag
4. **Static generation** where appropriate

### UI/UX Design
1. **Follow style-guide.md** conventions:
   - Use custom Tailwind classes (`bg-primary-blue`, `shadow-level-2`, etc.)
   - Implement glassmorphic effects with `.glass-card`
   - Use proper spacing system (`p-lg`, `m-xl`, etc.)
   - Apply consistent typography (`text-xl font-semibold`, etc.)

2. **Responsive design** for all screen sizes
3. **Loading states** and error handling
4. **Accessible markup** with proper ARIA labels

### Testing Strategy
1. **Admin role access** testing
2. **Form validation** testing
3. **Image upload** functionality
4. **Slug uniqueness** validation
5. **Public visibility** of published posts

---

## Estimated Development Timeline

### Phase 1: Admin Panel (3-4 days)
- Day 1: Blog list view and delete functionality
- Day 2: Create new blog post form
- Day 3: Edit blog post functionality
- Day 4: Testing and refinements

### Phase 2: Public Views (2-3 days)
- Day 1: Public blog listing with pagination
- Day 2: Single blog post view
- Day 3: SEO optimization and testing

### Phase 3: Integration & Polish (1-2 days)
- Day 1: Navigation updates, error handling
- Day 2: Final testing and documentation

**Total Estimated Time:** 6-9 days

---

## Success Criteria

### Admin Features ✅
- [ ] Admin users can view all blog posts in a table
- [ ] Admin users can create new blog posts with rich text content
- [ ] Admin users can edit existing blog posts
- [ ] Admin users can delete blog posts (soft delete)
- [ ] Image uploads work for featured images
- [ ] Slug generation and uniqueness validation works
- [ ] Status management (Draft/Published) functions correctly

### Public Features ✅
- [ ] Published blog posts are visible to the public
- [ ] Blog listing page shows posts with pagination
- [ ] Individual blog posts are accessible via SEO-friendly URLs
- [ ] Content renders safely without XSS vulnerabilities
- [ ] Responsive design works on all devices

### Technical Requirements ✅
- [ ] Follows VSA architecture patterns
- [ ] Uses project's design system consistently
- [ ] Implements proper error handling
- [ ] Includes appropriate loading states
- [ ] SEO optimized with meta tags
- [ ] Performance optimized with caching

---

## Next Steps

1. **Start with Phase 1.1** (Admin Blog List View) as it provides the foundation
2. **Implement in order** to maintain dependencies between components
3. **Test thoroughly** at each phase before moving to the next
4. **Document any deviations** from this plan as implementation progresses

This plan provides a comprehensive roadmap for implementing the blog feature while maintaining consistency with the project's architecture and design principles.
