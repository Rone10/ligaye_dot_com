# Ligaye.com UI Style Guide

## 1. Design Philosophy & Visual Language

The Ligaye.com interface embodies a modern, professional aesthetic with a focus on clarity and refinement. The design leverages glassmorphic elements to create a sense of depth and sophistication while maintaining excellent readability and usability.

### Key Aesthetic Principles:
- **Clean & Airy**: Ample white space with thoughtful content distribution
- **Depth Through Transparency**: Layered interface with translucent elements
- **Subtle Shadows**: Delicate shadows that indicate elevation without overwhelming
- **Rounded Geometry**: Soft, rounded corners throughout for a friendly, approachable feel
- **Functional Beauty**: Visual elements that enhance rather than distract from functionality

## 2. Color Palette

### Primary Colors
- **Primary Blue**: Use `bg-primary-blue`, `text-primary-blue`, `border-primary-blue` - Used for primary actions, key UI elements, and emphasis
- **Primary Blue (Light)**: Use `bg-primary-blue-light`, `text-primary-blue-light` - Used for hover states, secondary actions related to primary blue
- **Secondary Green**: Use `bg-secondary-green`, `text-secondary-green` - Used for success states, highlights, and complementary accents

### Neutrals
- **Dark**: Use `bg-theme-dark`, `text-theme-dark` - Primary text color, icons, and other key elements
- **Light**: Use `bg-theme-light`, `text-theme-light` - Page backgrounds, cards, and other container elements
- **Gray**: Use `bg-theme-gray`, `text-theme-gray`, `border-theme-gray` - Borders, dividers, and subtle backgrounds
- **Gray Dark**: Use `bg-theme-gray-dark`, `text-theme-gray-dark` - Secondary text, hints, and less important elements

### Gradients
- **Background Gradient**: Use `bg-gradient-bg` - Used for page backgrounds to add subtle dimension

### Tailwind Class Usage
**CRITICAL:** Always use the custom Tailwind classes defined in `tailwind.config.ts` instead of hardcoded hex values:
```tsx
// CORRECT - Use custom Tailwind classes
<div className="bg-primary-blue text-white">Primary Action</div>
<div className="bg-theme-gray border-theme-gray">Card Background</div>

// INCORRECT - Don't use hardcoded values
<div className="bg-[#4a6cfa] text-white">Primary Action</div>
<div className="bg-[#e1e5f2] border-[#e1e5f2]">Card Background</div>
```

## 3. Typography

### Font Sizes
Use the custom Tailwind font size classes:
- **Extra Large (Headers)**: `text-3xl` (24px)
- **Large (Subheaders)**: `text-xl` - `text-2xl` (18px - 20px)
- **Medium (Standard)**: `text-base` - `text-lg` (15px - 16px)
- **Small (Secondary)**: `text-sm` (13px)
- **Extra Small (Tertiary)**: `text-xs` (12px)

### Font Weights
Use the custom Tailwind font weight classes:
- **Regular**: `font-normal` (400) - Used for body text and general content
- **Medium**: `font-medium` (500) - Used for emphasis within body text
- **Semi-Bold**: `font-semibold` (600) - Used for subheadings, labels, and important UI elements
- **Bold**: `font-bold` (700) - Used for main headings and key interactive elements

### Line Heights
Use the custom Tailwind line height classes:
- **Tight**: `leading-tight` (1.2) - For headings and short text elements
- **Standard**: `leading-normal` (1.5) - For body text and general content
- **Relaxed**: `leading-relaxed` (1.8) - For improved readability in dense paragraphs

### Typography Usage Examples
```tsx
// CORRECT - Use custom Tailwind classes
<h1 className="text-3xl font-bold leading-tight text-theme-dark">Main Heading</h1>
<p className="text-base font-normal leading-normal text-theme-dark">Body text</p>
<span className="text-sm font-medium text-theme-gray-dark">Secondary text</span>

// INCORRECT - Don't use hardcoded values
<h1 className="text-[24px] font-[700] leading-[1.2]">Main Heading</h1>
```

## 4. Spacing System

The spacing system uses a 4-point grid with custom Tailwind spacing classes.

### Key Spacing Values
Use the custom Tailwind spacing classes:
- **Extra Small**: `p-xxs`, `m-xxs` (4px), `p-xs`, `m-xs` (8px) - For tight relationships between elements
- **Small**: `p-sm`, `m-sm` (12px), `p-md`, `m-md` (16px) - For related elements within a component
- **Medium**: `p-lg`, `m-lg` (20px), `p-xl`, `m-xl` (25px) - For separating components or sections
- **Large**: `p-2xl`, `m-2xl` (30px), `p-3xl`, `m-3xl` (40px) - For major section breaks
- **Extra Large**: `p-4xl`, `m-4xl` (50px), `p-5xl`, `m-5xl` (60px) - For page-level spacing

### Spacing Usage Examples
```tsx
// CORRECT - Use custom Tailwind spacing classes
<div className="p-lg m-xl">Content with proper spacing</div>
<div className="px-md py-sm">Form element spacing</div>

// INCORRECT - Don't use hardcoded values
<div className="p-[20px] m-[25px]">Content with hardcoded spacing</div>
```

## 5. Glassmorphic Effects

The interface uses a distinctive glassmorphic style. Use the predefined `.glass-card` class from `globals.css`:

```tsx
// CORRECT - Use the predefined glass-card class
<div className="glass-card p-xl">
  Glassmorphic content container
</div>

// The glass-card class includes:
// - Adaptive background opacity
// - Backdrop blur effect
// - Subtle border
// - Proper border radius and shadow
```

## 6. Elevation & Shadow System

Use the custom Tailwind shadow classes for consistent elevation:

### Shadow Levels
- **Level 1 (Subtle)**: `shadow-level-1` - For subtle elevation
- **Level 2 (Standard)**: `shadow-level-2` - Standard component elevation
- **Level 3 (Elevated)**: `shadow-level-3` - For elevated or highlighted elements
- **Level 4 (Floating)**: `shadow-level-4` - For modals, dropdowns, and floating elements
- **Focus Shadow**: `shadow-focus` - For focus states

### Shadow Usage Examples
```tsx
// CORRECT - Use custom shadow classes
<div className="shadow-level-2 rounded-lg">Standard card</div>
<div className="shadow-level-4 rounded-lg">Modal or dropdown</div>
<input className="focus:shadow-focus" />

// INCORRECT - Don't use hardcoded shadow values
<div className="shadow-[0_8px_32px_rgba(31,38,135,0.1)]">Card</div>
```

## 7. Border Radius System

Use the custom Tailwind border radius classes:

### Border Radius Values
- **Small**: `rounded-sm` (4px) - For small elements like checkboxes, chips
- **Medium**: `rounded-md` (10px) - For buttons, input fields, and cards
- **Large**: `rounded-lg` (16px) - For major containers and sections
- **Extra Large**: `rounded-xl` (20px) - For prominent containers
- **Circular**: `rounded-full` - For avatars, icons, and circular elements

### Border Radius Usage Examples
```tsx
// CORRECT - Use custom border radius classes
<button className="rounded-md">Standard button</button>
<div className="rounded-lg">Card container</div>
<img className="rounded-full" />

// INCORRECT - Don't use hardcoded values
<button className="rounded-[10px]">Button</button>
```

## 8. Input Elements & Forms

### Input Fields
Use the predefined `.input-field` class or build with custom Tailwind classes:

```tsx
// Option 1: Use predefined class
<input className="input-field" />

// Option 2: Build with custom Tailwind classes
<input className="h-[46px] px-md rounded-md border border-theme-gray focus:border-primary-blue focus:shadow-focus" />
```

### Buttons
Use the predefined button classes or build with custom Tailwind classes:

```tsx
// Primary Button - Use predefined class or custom classes
<button className="button-primary">Submit</button>
// OR
<button className="bg-primary-blue text-white px-lg py-md rounded-md shadow-level-2 hover:bg-primary-blue-light duration-standard font-semibold">
  Submit
</button>

// Secondary Button
<button className="button-secondary">Cancel</button>
// OR
<button className="bg-theme-light text-theme-dark px-md py-sm rounded-md border border-theme-gray hover:bg-theme-gray/10 duration-standard font-semibold">
  Cancel
</button>
```

## 9. Component Styling

### Cards
```tsx
// CORRECT - Use glassmorphic card with proper spacing
<div className="glass-card p-xl rounded-lg">
  <h2 className="text-xl font-semibold text-theme-dark mb-md">Card Title</h2>
  <p className="text-base text-theme-gray-dark">Card content</p>
</div>
```

### Tags & Chips
```tsx
// CORRECT - Use custom classes for tags
<span className="bg-primary-blue/10 text-primary-blue px-sm py-xxs rounded-full text-sm font-medium border border-primary-blue/20">
  Tag Label
</span>
```

### Dropdowns & Select Elements
```tsx
// CORRECT - Use custom classes for dropdowns
<select className="bg-theme-light border border-theme-gray rounded-md px-md py-sm text-theme-dark">
  <option>Select option</option>
</select>
```

## 10. Interactive States

### Hover States
```tsx
// CORRECT - Use custom classes for hover effects
<button className="bg-primary-blue hover:bg-primary-blue-light hover:scale-105 duration-standard">
  Hover me
</button>
```

### Focus States
```tsx
// CORRECT - Use focus shadow class
<input className="border border-theme-gray focus:border-primary-blue focus:shadow-focus" />
```

## 11. Animations & Transitions

### Timing
Use the custom Tailwind duration classes:
- **Fast**: `duration-fast` (150ms) - For small UI responses
- **Standard**: `duration-standard` (300ms) - For most transitions
- **Slow**: `duration-slow` (500ms) - For more attention-grabbing animations

### Transition Usage Examples
```tsx
// CORRECT - Use custom duration classes
<button className="bg-primary-blue hover:bg-primary-blue-light duration-standard">
  Smooth transition
</button>

<div className="transform hover:scale-105 duration-fast">
  Quick hover effect
</div>
```

## 12. Complete Component Examples

### Primary Action Button
```tsx
<button className="bg-primary-blue text-white px-lg py-md rounded-md shadow-level-2 hover:bg-primary-blue-light hover:shadow-level-3 duration-standard font-semibold">
  Primary Action
</button>
```

### Card Component
```tsx
<div className="glass-card p-xl rounded-lg shadow-level-2 hover:shadow-level-3 duration-standard">
  <h3 className="text-xl font-semibold text-theme-dark mb-md">Card Title</h3>
  <p className="text-base text-theme-gray-dark leading-normal mb-lg">
    Card description with proper typography and spacing.
  </p>
  <button className="bg-primary-blue text-white px-md py-sm rounded-md hover:bg-primary-blue-light duration-standard">
    Action
  </button>
</div>
```

### Form Input
```tsx
<div className="mb-lg">
  <label className="block text-sm font-medium text-theme-dark mb-xs">
    Input Label
  </label>
  <input 
    type="text"
    className="w-full h-[46px] px-md rounded-md border border-theme-gray focus:border-primary-blue focus:shadow-focus duration-standard"
    placeholder="Enter text..."
  />
</div>
```

## 13. Key Reminders for Developers

### ✅ DO:
- Use `bg-primary-blue` instead of `bg-[#4a6cfa]`
- Use `p-lg` instead of `p-[20px]`
- Use `shadow-level-2` instead of `shadow-[0_8px_32px_rgba(31,38,135,0.1)]`
- Use `rounded-md` instead of `rounded-[10px]`
- Use `duration-standard` instead of `duration-[300ms]`

### ❌ DON'T:
- Use hardcoded hex values in square brackets
- Use hardcoded pixel values for spacing
- Use hardcoded shadow values
- Use hardcoded border radius values
- Use hardcoded transition durations

### Quick Reference
```tsx
// Colors
bg-primary-blue, bg-primary-blue-light, bg-secondary-green
bg-theme-dark, bg-theme-light, bg-theme-gray, bg-theme-gray-dark

// Spacing
p-xxs (4px), p-xs (8px), p-sm (12px), p-md (16px), p-lg (20px), p-xl (25px)

// Typography
text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl
font-normal, font-medium, font-semibold, font-bold

// Shadows
shadow-level-1, shadow-level-2, shadow-level-3, shadow-level-4, shadow-focus

// Border Radius
rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-full

// Transitions
duration-fast, duration-standard, duration-slow
```