# Tenders Feature Implementation Plan

## 1. Overview & Architecture

This implementation plan details the creation of a comprehensive Tenders feature for Ligaye.com following strict Vertical Slice Architecture (VSA) principles. The feature will be organized within `app/(public)/tenders/` with granular slices for each route segment, ensuring complete isolation and adherence to the project's established conventions.

### 1.1 Route Structure
```
app/(public)/tenders/
├── page.tsx                    # List View (Server Component)
├── _components/                # Components for List View only
├── _actions.ts                 # Server Actions for List View
├── _queries.ts                 # DB queries for List View
├── _utils/                     # Utils for List View
├── loading.tsx                 # Loading UI for List View
├── new/                        # Create Tender Slice
│   ├── page.tsx               # Create Form View (Server Component)
│   ├── _components/           # Components for Create View only
│   ├── _actions.ts            # Server Actions for Create View
│   ├── _queries.ts            # DB queries for Create View
│   ├── _utils/                # Utils for Create View (validation)
│   └── loading.tsx            # Loading UI for Create View
└── [id]/                      # Tender Detail Slice
    ├── page.tsx               # Detail View (Server Component)
    ├── _components/           # Components for Detail View only
    ├── _actions.ts            # Server Actions for Detail View
    ├── _queries.ts            # DB queries for Detail View
    ├── loading.tsx            # Loading UI for Detail View
    └── edit/                  # Edit Tender Sub-slice
        ├── page.tsx           # Edit Form View (Server Component)
        ├── _components/       # Components for Edit View only
        ├── _actions.ts        # Server Actions for Edit View
        ├── _queries.ts        # DB queries for Edit View
        ├── _utils/            # Utils for Edit View (validation)
        └── loading.tsx        # Loading UI for Edit View
```

## 2. Implementation Steps by Route Segment

### 2.1 List Tenders (`app/(public)/tenders/`)

#### 2.1.1 Files to Create

**`app/(public)/tenders/page.tsx`** (Server Component)
- **Purpose**: Main list view displaying paginated tenders
- **Data Flow**: Server Component → `_queries.ts` → Database
- **Key Responsibilities**:
  - Fetch initial tenders data using `getTenders()`
  - Handle search params for pagination/filtering
  - Render `TendersDataTable` and `TenderFilters` components
  - Include "Create New Tender" button (conditional on authentication)

**Function Signatures**:
```typescript
interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sector?: string;
    location?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function TendersPage({ searchParams }: PageProps)
```

**`app/(public)/tenders/_queries.ts`**
- **Purpose**: Database queries specific to the list view
- **Data Access Pattern**: Uses `await db()` from `@/lib/db`
- **Functions**:

```typescript
import { db } from '@/lib/db';
import { tenders, sectors, locations } from '@/lib/db/schema';
import type { Tender, Sector, Location } from '@/lib/db/schema';

export interface TenderFiltersType {
  sectorId?: string;
  locationId?: string;
  status?: string;
  search?: string;
}

export interface GetTendersParams {
  page?: number;
  limit?: number;
  filters?: TenderFiltersType;
}

export async function getTenders(params: GetTendersParams): Promise<Tender[]>
export async function getTendersCount(params: { filters?: TenderFiltersType }): Promise<number>
export async function getSectorsForFilter(): Promise<Sector[]>
export async function getLocationsForFilter(): Promise<Location[]>
```

**`app/(public)/tenders/_components/TendersDataTable.tsx`** (`'use client'`)
- **Purpose**: Display tenders in a table format using Shadcn Table
- **Data Flow**: Client Component → Server Action → `_queries.ts` → Database (for delete)
- **Key Features**:
  - Columns: Title, Organization, Sector, Location, Deadline, Status
  - Row actions: View, Edit (conditional), Delete (conditional)
  - Uses Shadcn Table, Button, and Dialog components
  - Implements loading states and error handling

**Props Interface**:
```typescript
interface TendersDataTableProps {
  tenders: Tender[];
  currentUserId?: string;
  totalCount: number;
  currentPage: number;
  limit: number;
}
```

**`app/(public)/tenders/_components/TenderFilters.tsx`** (`'use client'`)
- **Purpose**: Filter controls for the tenders list
- **State Management**: Uses `nuqs` for URL state management
- **Components**: Shadcn Select, Input, Button for filters
- **Filters**: Sector, Location, Status, Search text

**`app/(public)/tenders/_actions.ts`**
- **Purpose**: Server actions for list view operations
- **Functions**:

```typescript
export async function deleteTenderAction(tenderId: string): Promise<{
  success: boolean;
  error?: string;
}>
```

**`app/(public)/tenders/_utils/types.ts`**
- **Purpose**: Local types specific to the list view
- **Content**: Filter types, table props, pagination types

**`app/(public)/tenders/loading.tsx`**
- **Purpose**: Loading UI for the list view
- **Implementation**: Skeleton components matching the table layout

#### 2.1.2 Authentication & Authorization Logic
- Check user authentication status using `getUser()` from `@/lib/supabase/server`
- Show "Create New Tender" button only for authenticated users
- Show Edit/Delete actions only for tender owners
- Authorization checks in `deleteTenderAction`

### 2.2 Create Tender (`app/(public)/tenders/new/`)

#### 2.2.1 Files to Create

**`app/(public)/tenders/new/page.tsx`** (Server Component)
- **Purpose**: Create tender form page
- **Authentication**: Requires user authentication (redirect if not authenticated)
- **Data Flow**: Server Component → `_queries.ts` → Database (for dropdown data)
- **Responsibilities**:
  - Verify user authentication
  - Fetch sectors and locations for dropdowns
  - Render `NewTenderForm` component

**`app/(public)/tenders/new/_queries.ts`**
- **Purpose**: Database queries for create view
- **Functions**:

```typescript
export async function getSectors(): Promise<Sector[]>
export async function getLocations(): Promise<Location[]>
export async function insertTender(data: NewTenderDataType, userId: string): Promise<Tender>
```

**`app/(public)/tenders/new/_components/NewTenderForm.tsx`** (`'use client'`)
- **Purpose**: React Hook Form for creating tenders
- **Data Flow**: Client Component → Server Action → `_queries.ts` → Database
- **Form Fields**:
  - `title` (Input)
  - `description` (RichTextEditor from `@/components/RichTextEditor/editor`)
  - `organizationName` (Input)
  - `tenderType` (Select with `tenderTypeEnum` values)
  - `sectorId` (Select with sectors data)
  - `locationId` (Select with locations data)
  - `deadline` (DatePicker)
  - `budgetRange` (Input)
  - `contactInformation` (Textarea)
  - `externalLink` (Input with URL validation)
  - `status` (Select, default to 'DRAFT')

**Props Interface**:
```typescript
interface NewTenderFormProps {
  sectors: Sector[];
  locations: Location[];
}
```

**`app/(public)/tenders/new/_utils/validation.ts`**
- **Purpose**: Zod schemas for form validation
- **Schema**:

```typescript
import { z } from 'zod';
import { tenderTypeEnum, tenderStatusEnum } from '@/lib/db/schema';

export const newTenderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  tenderType: z.enum(tenderTypeEnum.enumValues),
  sectorId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  deadline: z.date().optional(),
  budgetRange: z.string().optional(),
  contactInformation: z.string().optional(),
  externalLink: z.string().url().optional().or(z.literal('')),
  status: z.enum(tenderStatusEnum.enumValues).default('DRAFT'),
});

export type NewTenderSchemaType = z.infer<typeof newTenderSchema>;
```

**`app/(public)/tenders/new/_actions.ts`**
- **Purpose**: Server actions for creating tenders
- **Functions**:

```typescript
export async function createTenderAction(formData: NewTenderSchemaType): Promise<{
  success: boolean;
  tenderId?: string;
  error?: string;
}>
```

**Implementation Logic**:
1. Validate form data using Zod schema
2. Get current user using `getUser()`
3. Verify user is authenticated
4. Call `insertTender()` from `_queries.ts`
5. Redirect to tender detail page or list on success
6. Return error state on failure

### 2.3 View Tender Details (`app/(public)/tenders/[id]/`)

#### 2.3.1 Files to Create

**`app/(public)/tenders/[id]/page.tsx`** (Server Component)
- **Purpose**: Display detailed tender information
- **Data Flow**: Server Component → `_queries.ts` → Database
- **Props Handling**: Await `params.id` (Next.js 15 requirement)

```typescript
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TenderDetailPage({ params }: PageProps) {
  const id = await params.id;
  // ... rest of implementation
}
```

**`app/(public)/tenders/[id]/_queries.ts`**
- **Purpose**: Database queries for detail view
- **Functions**:

```typescript
export async function getTenderById(id: string): Promise<TenderWithRelations | null>

interface TenderWithRelations extends Tender {
  sector?: Sector;
  location?: Location;
  user?: Pick<Profile, 'id' | 'fullName'>;
}
```

**`app/(public)/tenders/[id]/_components/TenderDetailDisplay.tsx`**
- **Purpose**: Render tender details in a structured layout
- **Styling**: Follow `style-guide.md` with glassmorphic cards
- **Content Sections**:
  - Header with title and status
  - Organization and contact information
  - Description (rendered as HTML from RichTextEditor)
  - Metadata (sector, location, deadline, budget)
  - External link (if provided)

**`app/(public)/tenders/[id]/_components/DeleteTenderDialog.tsx`** (`'use client'`)
- **Purpose**: Confirmation dialog for tender deletion
- **Components**: Shadcn Dialog, Button
- **Data Flow**: Client Component → Server Action → `_queries.ts` → Database

**`app/(public)/tenders/[id]/_actions.ts`**
- **Purpose**: Server actions for detail view operations
- **Functions**:

```typescript
export async function deleteTenderAction(tenderId: string): Promise<{
  success: boolean;
  error?: string;
}>
```

### 2.4 Edit Tender (`app/(public)/tenders/[id]/edit/`)

#### 2.4.1 Files to Create

**`app/(public)/tenders/[id]/edit/page.tsx`** (Server Component)
- **Purpose**: Edit tender form page
- **Authorization**: Verify user owns the tender
- **Data Flow**: Server Component → `_queries.ts` → Database
- **Error Handling**: Handle not found and unauthorized cases

**`app/(public)/tenders/[id]/edit/_queries.ts`**
- **Purpose**: Database queries for edit view
- **Functions**:

```typescript
export async function getTenderByIdForEdit(id: string): Promise<Tender | null>
export async function updateTender(id: string, data: UpdateTenderDataType, userId: string): Promise<Tender | null>
export async function getSectors(): Promise<Sector[]>
export async function getLocations(): Promise<Location[]>
```

**`app/(public)/tenders/[id]/edit/_components/EditTenderForm.tsx`** (`'use client'`)
- **Purpose**: Pre-filled form for editing tenders
- **Similarity**: Similar to `NewTenderForm` but with existing data
- **Data Flow**: Client Component → Server Action → `_queries.ts` → Database

**`app/(public)/tenders/[id]/edit/_utils/validation.ts`**
- **Purpose**: Validation schema for updates
- **Schema**: Similar to create schema, potentially with different requirements

```typescript
export const updateTenderSchema = newTenderSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateTenderSchemaType = z.infer<typeof updateTenderSchema>;
```

**`app/(public)/tenders/[id]/edit/_actions.ts`**
- **Purpose**: Server actions for updating tenders
- **Functions**:

```typescript
export async function updateTenderAction(tenderId: string, formData: UpdateTenderSchemaType): Promise<{
  success: boolean;
  error?: string;
}>
```

**Authorization Logic**:
1. Get current user
2. Fetch tender to verify ownership
3. Compare `tender.userId` with current user ID
4. Proceed with update if authorized

## 3. Data Types & Interfaces

### 3.1 Local Type Definitions

Each slice will define its own specific types in `_utils/types.ts` or within the relevant files:

**List View Types** (`app/(public)/tenders/_utils/types.ts`):
```typescript
export interface TenderListItem extends Tender {
  sector?: Pick<Sector, 'id' | 'name'>;
  location?: Pick<Location, 'id' | 'region' | 'city'>;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}
```

**Form Data Types** (in respective `_utils/validation.ts` files):
```typescript
export interface NewTenderDataType {
  title: string;
  description: string;
  organizationName: string;
  tenderType: string;
  sectorId?: string;
  locationId?: string;
  deadline?: Date;
  budgetRange?: string;
  contactInformation?: string;
  externalLink?: string;
  status: string;
}
```

### 3.2 Database Schema Usage

The implementation will use existing types from `lib/db/schema.ts`:
- `Tender` (InferSelectModel)
- `NewTender` (InferInsertModel)
- `Sector`, `Location` types
- Enum values: `tenderTypeEnum`, `tenderStatusEnum`

## 4. Authentication & Authorization Implementation

### 4.1 Authentication Checks

**Server Components**:
```typescript
import { getUser } from '@/lib/supabase/server';

const user = await getUser();
if (!user) {
  redirect('/login');
}
```

**Server Actions**:
```typescript
export async function createTenderAction(formData: NewTenderSchemaType) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'Authentication required' };
  }
  // ... proceed with action
}
```

### 4.2 Authorization Logic

**Ownership Verification**:
```typescript
// In edit/delete actions
const tender = await getTenderById(tenderId);
if (!tender || tender.userId !== user.id) {
  return { success: false, error: 'Unauthorized' };
}
```

## 5. UI Implementation Guidelines

### 5.1 Styling Adherence

All components must follow `style-guide.md`:
- **Glassmorphic Effects**: Cards with `rgba(255, 255, 255, 0.7)` background and `blur(10px)`
- **Color Palette**: Primary blue `#4a6cfa`, secondary green `#05ce91`
- **Typography**: Segoe UI font family with consistent sizing
- **Spacing**: 4-point grid system
- **Border Radius**: `16px` for cards, `10px` for inputs

### 5.2 Component Usage

**Shadcn UI Components**:
- `Table` for data display
- `Button` for actions
- `Input`, `Textarea` for form fields
- `Select` for dropdowns
- `Dialog` for confirmations
- `Card` for content containers
- `Badge` for status indicators

### 5.3 Responsive Design

- Mobile-first approach
- Breakpoints: 576px, 768px, 992px, 1200px
- Touch-friendly targets (44px minimum)
- Simplified layouts for small screens

## 6. Error Handling & Loading States

### 6.1 Loading States

**Server Components**: Use `loading.tsx` files
**Client Components**: Internal loading states with skeleton components

### 6.2 Error Boundaries

**Route Level**: `error.tsx` files for each route segment
**Component Level**: Try-catch blocks in Server Actions

### 6.3 User Feedback

**Success/Error Messages**: Toast notifications using a toast library
**Form Validation**: Real-time validation with error display
**Confirmation Dialogs**: For destructive actions

## 7. Performance Considerations

### 7.1 Database Queries

- Use appropriate indexes (already defined in schema)
- Implement pagination for large datasets
- Select only necessary fields for list views
- Use joins for related data (sectors, locations)

### 7.2 Client-Side Optimization

- Lazy loading for non-critical components
- Debounced search inputs
- Optimistic updates where appropriate

## 8. Dependencies & Imports

### 8.1 New Dependencies

No new dependencies required. The implementation uses existing packages:
- React Hook Form (already installed)
- Zod (already installed)
- date-fns (already installed)
- nuqs (for URL state management)
- Lucide React (for icons)

### 8.2 Import Patterns

**Database Access**:
```typescript
import { db } from '@/lib/db';
import { tenders, sectors, locations } from '@/lib/db/schema';
import type { Tender, Sector, Location } from '@/lib/db/schema';
```

**Authentication**:
```typescript
import { getUser } from '@/lib/supabase/server';
```

**UI Components**:
```typescript
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
```

## 9. Implementation Priority

### 9.1 Phase 1: Core Structure
1. Create directory structure
2. Implement list view (`app/(public)/tenders/`)
3. Basic data fetching and display

### 9.2 Phase 2: CRUD Operations
1. Create tender functionality (`app/(public)/tenders/new/`)
2. View tender details (`app/(public)/tenders/[id]/`)
3. Edit tender functionality (`app/(public)/tenders/[id]/edit/`)

### 9.3 Phase 3: Enhanced Features
1. Filtering and search
2. Pagination
3. Advanced UI polish
4. Performance optimizations

## 10. Critical Architectural Decisions

### 10.1 Slice Isolation

**Decision**: Each route segment maintains its own `_queries.ts`, `_actions.ts`, and `_components/`
**Justification**: Follows VSA principles, prevents coupling, allows independent evolution
**Trade-off**: Some code duplication (e.g., similar validation schemas) is acceptable

### 10.2 Authentication Strategy

**Decision**: Server-side authentication checks in both Server Components and Server Actions
**Justification**: Ensures security at multiple layers, provides better UX with proper redirects
**Implementation**: Use `getUser()` consistently across all protected routes

### 10.3 Data Access Pattern

**Decision**: All database interactions through slice-specific `_queries.ts` files
**Justification**: Maintains data access isolation, follows project conventions
**Pattern**: Server Component/Action → `_queries.ts` → Drizzle ORM → Database

### 10.4 Form Handling

**Decision**: React Hook Form with Zod validation in each slice's `_utils/validation.ts`
**Justification**: Type-safe validation, good UX, follows project patterns
**Benefit**: Client-side validation with server-side verification

This implementation plan ensures strict adherence to the project's VSA architecture while providing a comprehensive, secure, and user-friendly Tenders feature that integrates seamlessly with the existing Ligaye.com platform.
