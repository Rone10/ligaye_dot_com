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
- **Primary Blue**: `#4a6cfa` - Used for primary actions, key UI elements, and emphasis
- **Primary Blue (Light)**: `#7b90ff` - Used for hover states, secondary actions related to primary blue
- **Secondary Green**: `#05ce91` - Used for success states, highlights, and complementary accents

### Neutrals
- **Dark**: `#1a1e2d` - Primary text color, icons, and other key elements
- **Light**: `#f8faff` - Page backgrounds, cards, and other container elements
- **Gray**: `#e1e5f2` - Borders, dividers, and subtle backgrounds
- **Gray Dark**: `#9aa3bc` - Secondary text, hints, and less important elements

### Gradients
- **Background Gradient**: `linear-gradient(135deg, #e9efff 0%, #f4f7ff 100%)` - Used for page backgrounds to add subtle dimension

## 3. Typography

### Font Family
- Primary Font: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` - A clean, modern sans-serif that works well at various sizes

### Font Sizes
- **Extra Large (Headers)**: `24px`
- **Large (Subheaders)**: `18px` - `20px`
- **Medium (Standard)**: `15px` - `16px`
- **Small (Secondary)**: `13px` - `14px`
- **Extra Small (Tertiary)**: `12px`

### Font Weights
- **Regular**: `400` - Used for body text and general content
- **Medium**: `500` - Used for emphasis within body text
- **Semi-Bold**: `600` - Used for subheadings, labels, and important UI elements
- **Bold**: `700` - Used for main headings and key interactive elements

### Line Heights
- **Tight**: `1.2` - For headings and short text elements
- **Standard**: `1.5` - For body text and general content
- **Relaxed**: `1.8` - For improved readability in dense paragraphs

## 4. Spacing System

The spacing system uses a 4-point grid as its foundation, with common spacing values being multiples of 4px.

### Key Spacing Values
- **Extra Small**: `4px` - `8px` - For tight relationships between elements
- **Small**: `10px` - `15px` - For related elements within a component
- **Medium**: `20px` - `25px` - For separating components or sections
- **Large**: `30px` - `40px` - For major section breaks
- **Extra Large**: `50px` - `60px` - For page-level spacing

## 5. Glassmorphic Effects

The interface uses a distinctive glassmorphic style that creates a sense of layered depth.

### Glass Element Specifications
- **Background**: `rgba(255, 255, 255, 0.7)` - 70% opaque white
- **Backdrop Filter**: `blur(10px)` - Creates the frosted glass effect
- **Border**: `1px solid rgba(255, 255, 255, 0.3)` - Subtle highlight on edges
- **Border Radius**: `16px` - Consistent rounded corners
- **Box Shadow**: `0 8px 32px rgba(31, 38, 135, 0.1)` - Soft, subtle shadow for depth

## 6. Elevation & Shadow System

Shadows are used consistently to create a sense of elevation and hierarchy.

### Shadow Levels
- **Level 1 (Subtle)**: `0 2px 10px rgba(31, 38, 135, 0.05)` - For subtle elevation
- **Level 2 (Standard)**: `0 8px 32px rgba(31, 38, 135, 0.1)` - Standard component elevation
- **Level 3 (Elevated)**: `0 15px 35px rgba(31, 38, 135, 0.15)` - For elevated or highlighted elements
- **Level 4 (Floating)**: `0 24px 48px rgba(31, 38, 135, 0.2)` - For modals, dropdowns, and floating elements

## 7. Border Radius System

Rounded corners are applied consistently throughout the interface.

### Border Radius Values
- **Small**: `4px` - `8px` - For small elements like checkboxes, chips
- **Medium**: `10px` - `12px` - For buttons, input fields, and cards
- **Large**: `16px` - `20px` - For major containers and sections
- **Circular**: `50%` - For avatars, icons, and circular elements

## 8. Input Elements & Forms

### Input Fields
- **Height**: `46px` - Standard height for text inputs
- **Padding**: `14px` horizontal, with additional space for icons
- **Border**: `1px solid var(--gray)`
- **Border Radius**: `10px`
- **Focus State**: Border color changes to primary blue with a subtle shadow glow
- **Shadow on Focus**: `0 0 0 3px rgba(74, 108, 250, 0.15)` - Subtle highlight

### Buttons
- **Primary Button**:
  - Background: Primary blue
  - Text: White
  - Padding: `12px 25px`
  - Border Radius: `10px`
  - Font Weight: 600
  - Hover: Slightly lighter blue shade
  
- **Secondary Button**:
  - Background: White
  - Text: Dark color
  - Border: `1px solid var(--gray)`
  - Padding: `10px 20px`
  - Border Radius: `8px`
  - Hover: Slight background color change

## 9. Component Styling

### Cards
- **Background**: Glassmorphic effect (as specified in section 5)
- **Padding**: `25px`
- **Border Radius**: `16px`
- **Transition**: `all 0.3s` - Smooth transitions for hover effects
- **Hover Effect**: Subtle elevation change (slight y-axis translation upward) and increased shadow

### Tags & Chips
- **Padding**: `5px 12px` for small tags, `6px 15px` for standard tags
- **Border Radius**: `20px` - `30px` (pronounced rounded ends)
- **Background**: Subtle variations of primary colors at low opacity
- **Text**: Related to the background color but more saturated for contrast
- **Border**: Often `1px solid` matching the text color at lower opacity

### Dropdowns & Select Elements
- **Background**: White
- **Border**: `1px solid var(--gray)`
- **Border Radius**: `8px`
- **Padding**: `10px 15px`
- **Arrow Indicator**: Subtle downward-pointing arrow in muted gray

## 10. Interactive States

### Hover States
- **Color Shift**: Elements darken or lighten slightly when hovered
- **Scale**: Some elements grow very slightly (105%) on hover
- **Elevation**: Shadow may increase or element may rise slightly
- **Transition**: All hover effects use smooth transitions (`transition: all 0.3s`)

### Active/Pressed States
- **Depth Change**: Elements appear to be pressed inward
- **Color Change**: Slightly more pronounced than hover state

### Focus States
- **Outline**: Replaced with a subtle glow effect using box-shadow
- **Color Change**: Primary elements take on a slightly more saturated hue

## 11. Animations & Transitions

### Timing
- **Fast**: `0.15s` - For small UI responses
- **Standard**: `0.3s` - For most transitions
- **Deliberate**: `0.5s` - For more attention-grabbing animations

### Easing Functions
- **Standard**: `ease` or `ease-in-out` - Smooth, natural feeling transitions
- **Emphasis**: `cubic-bezier(0.2, 0.8, 0.2, 1)` - For more dramatic animations

## 12. Icon System

### Icon Sizing
- **Small**: `16px` - For inline use with text
- **Medium**: `18px` - `20px` - For standard UI elements
- **Large**: `24px` - For primary navigation or emphasis

### Icon Treatment
- **Stroke Width**: Consistent 1.5px to 2px stroke width
- **Corner Radius**: Slightly rounded corners on iconic elements
- **Color**: Either in neutral tones or primary brand colors
- **States**: Icons change color on hover/active states to match text elements

## 13. Responsive Design Principles

### Breakpoints
- **Small**: `576px` - Mobile devices
- **Medium**: `768px` - Tablets and small desktops
- **Large**: `992px` - Desktops
- **Extra Large**: `1200px` - Large desktop displays

### Adaptation Principles
- **Simplified Layout**: Single-column layouts for small screens
- **Touch Targets**: Minimum 44px × 44px for touch interfaces
- **Spacing Reduction**: Reduced margins and padding (by ~25-40%) on small screens
- **Font Size Adjustments**: Slight reduction in font sizes for mobile (typically ~10-15% smaller)

## 14. Examples & Applications

### Primary Content Containers
- Full-width glassmorphic panels with consistent padding
- Subtle shadows that increase on interaction
- Clean, hierarchical typography with proper spacing

### Action Elements
- Blue primary buttons with appropriate hover effects
- White/transparent secondary buttons
- Interactive elements with clear affordances

### Information Hierarchy
- Clear typographic scale with proper weight differences
- Consistent spacing between related and unrelated elements
- Color used strategically to guide attention

### Visual Feedback
- Clear hover and active states for interactive elements
- Transitions that feel natural and enhance understanding
- Focus states that are both accessible and aesthetically pleasing