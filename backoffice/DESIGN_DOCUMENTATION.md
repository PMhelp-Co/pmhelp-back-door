# PMHelp Back-Office Design Documentation

This document explains the current design approach, structure, and styling decisions for the PMHelp Back-Office system. Use this as a reference when redesigning to match PMHelp's brand theme and standard styling.

---

## 🎨 Overall Design Philosophy

### Design Approach
- **Minimalist and Functional**: Clean, uncluttered interface focused on data presentation and task completion
- **Professional Admin Interface**: Business-appropriate styling suitable for internal team use
- **Utility-First**: Prioritizes functionality over decorative elements
- **Component-Based**: Reusable UI components with consistent styling patterns
- **Responsive**: Mobile-friendly with adaptive layouts

### Design System Foundation
- **CSS Variables**: Centralized color, spacing, and styling tokens
- **Normalize.css**: Cross-browser consistency reset
- **Flexbox/Grid**: Modern layout techniques for responsive design
- **No External UI Libraries**: Pure CSS/HTML/JavaScript (no Bootstrap, Material UI, etc.)

---

## 🎨 Color Scheme

### Primary Colors
```css
--primary-color: #2563eb;        /* Blue - Primary actions, active states */
--primary-hover: #1d4ed8;        /* Darker blue for hover states */
--secondary-color: #64748b;     /* Gray - Secondary text, borders */
```

### Semantic Colors
```css
--success-color: #10b981;        /* Green - Success states, active badges */
--warning-color: #f59e0b;        /* Orange - Warning actions */
--danger-color: #ef4444;         /* Red - Delete actions, errors */
```

### Background Colors
```css
--bg-primary: #ffffff;           /* White - Main content cards */
--bg-secondary: #f8fafc;         /* Light gray - Page background */
--bg-tertiary: #f1f5f9;          /* Medium gray - Hover states, secondary buttons */
```

### Text Colors
```css
--text-primary: #1e293b;         /* Dark gray - Primary text */
--text-secondary: #64748b;       /* Medium gray - Secondary text, labels */
--text-muted: #94a3b8;           /* Light gray - Muted text, placeholders */
```

### Border & Shadow
```css
--border-color: #e2e8f0;         /* Light gray - Borders, dividers */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### Design Notes
- **Color Palette**: Blue-based primary with neutral grays
- **Contrast**: High contrast for accessibility (WCAG compliant)
- **Consistency**: All colors defined as CSS variables for easy theming

---

## 📝 Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```
- **System Fonts**: Uses native OS fonts for performance and familiarity
- **Fallback Chain**: Progressive fallback for cross-platform compatibility

### Font Sizes
- **H1 (Header)**: `1.5rem` (24px) - Page titles
- **H2 (Section)**: `1.75rem` (28px) - Tab headers
- **H3 (Subsection)**: `1.125rem` (18px) - Card titles, section headers
- **Body**: `0.9375rem` (15px) - Default text
- **Small**: `0.875rem` (14px) - Labels, secondary text
- **Tiny**: `0.75rem` (12px) - Badges, uppercase labels

### Font Weights
- **700 (Bold)**: Stat values, important numbers
- **600 (Semi-bold)**: Headings, button text
- **500 (Medium)**: Labels, tab buttons
- **400 (Regular)**: Body text (default)

### Typography Patterns
- **Line Height**: `1.6` for body text (readable spacing)
- **Letter Spacing**: `0.05em` for uppercase labels (stat card headers)
- **Text Transform**: Uppercase for labels, badges, table headers

---

## 📐 Layout Structure

### Overall Page Structure

#### Dashboard (`index.html`)
```
┌─────────────────────────────────────┐
│ Header (Fixed)                      │
│ - Title: "PMHelp Back-Office"       │
│ - User email + Logout button        │
├─────────────────────────────────────┤
│ Tab Navigation (Fixed)              │
│ - Analytics | Users | Marketing     │
├─────────────────────────────────────┤
│ Main Content (Scrollable)           │
│ - Tab-specific content              │
│ - Max-width: 1400px, centered       │
│ - Padding: 2rem                     │
└─────────────────────────────────────┘
```

#### Login Page (`login.html`)
```
┌─────────────────────────────────────┐
│                                     │
│     ┌───────────────────┐          │
│     │  Login Card       │          │
│     │  (Centered)       │          │
│     │  Max-width: 400px │          │
│     └───────────────────┘          │
│                                     │
└─────────────────────────────────────┘
```

### Layout Techniques
- **Flexbox**: Primary layout method (header, navigation, cards)
- **CSS Grid**: Statistics grid, form rows, user info grid
- **Max-width Container**: `1400px` for main content (prevents overly wide layouts)
- **Centered Content**: `margin: 0 auto` for horizontal centering

### Spacing System
```css
--spacing-xs: 0.25rem;   /* 4px - Tight spacing */
--spacing-sm: 0.5rem;    /* 8px - Small gaps */
--spacing-md: 1rem;      /* 16px - Default spacing */
--spacing-lg: 1.5rem;     /* 24px - Section spacing */
--spacing-xl: 2rem;      /* 32px - Large gaps */
```

---

## 📄 Page-by-Page Design Breakdown

### 1. Login Page (`login.html`)

#### Structure
- **Container**: Full viewport height, centered flex layout
- **Card**: White card with shadow, max-width 400px
- **Sections**:
  1. Header (title + subtitle)
  2. Login form (email + password)
  3. Error message area
  4. Footer (help text)

#### Visual Design
- **Background**: Light gray (`--bg-secondary`)
- **Card**: White with border, large shadow (`--shadow-lg`)
- **Border Radius**: `8px` (`--border-radius`)
- **Centered**: Vertically and horizontally centered
- **Form Fields**: Full-width inputs with focus states

#### Interactive Elements
- **Email Input**: Auto-focus on page load
- **Submit Button**: Full-width, disabled during submission
- **Error Display**: Red background, appears below form
- **Loading State**: Button text changes to "Logging in..."

#### Key CSS Classes
- `.login-container` - Full viewport flex container
- `.login-card` - White card with shadow
- `.login-header` - Centered title section
- `.login-form` - Form container
- `.error-message` - Error display styling

---

### 2. Dashboard Page (`index.html`)

#### Header Section
- **Layout**: Horizontal flex, space-between
- **Left**: "PMHelp Back-Office" title (H1)
- **Right**: User email + Logout button
- **Styling**: White background, bottom border, small shadow
- **Padding**: `1rem` vertical, `2rem` horizontal

#### Tab Navigation
- **Layout**: Horizontal flex, no gap between buttons
- **Buttons**: Text buttons with bottom border indicator
- **Active State**: Blue text + blue bottom border
- **Hover State**: Light gray background
- **Styling**: No background (transparent), border-bottom for active

#### Main Content Area
- **Layout**: Flex column, max-width 1400px, centered
- **Padding**: `2rem` on all sides
- **Tab Content**: Hidden by default, shown when `.active` class added
- **Sections**: Cards with white background, borders, shadows

---

## 🧩 Component Design

### 1. Stat Cards (Analytics Dashboard)

#### Structure
```html
<div class="stat-card">
  <h3>Label</h3>
  <p class="stat-value">Number</p>
</div>
```

#### Design
- **Background**: White (`--bg-primary`)
- **Border**: Light gray (`--border-color`)
- **Border Radius**: `8px`
- **Padding**: `1.5rem`
- **Shadow**: Small shadow (`--shadow-sm`)
- **Layout**: Grid container (responsive: 1-4 columns)

#### Typography
- **Label (H3)**: Uppercase, small font, gray color, letter-spacing
- **Value**: Large font (`2rem`), bold (`700`), dark color

---

### 2. Chart Section

#### Structure
```html
<div class="chart-section">
  <h3>Title</h3>
  <div class="chart-controls">...</div>
  <div class="chart-container">
    <div class="simple-chart">...</div>
  </div>
</div>
```

#### Design
- **Container**: White card with border and shadow
- **Chart Controls**: Horizontal flex, small buttons
- **Chart Area**: Flexbox bar chart (CSS-based, no library)
- **Bars**: Colored divs with calculated heights

#### Chart Implementation
- **Type**: Simple bar chart using flexbox
- **Bars**: `div` elements with `height` set in pixels
- **Layout**: `display: flex`, `align-items: flex-end`, `justify-content: space-around`
- **Colors**: Primary blue for bars
- **Height**: Fixed container height (`300px`), bars scale within

---

### 3. Tables

#### Structure
```html
<table>
  <thead>...</thead>
  <tbody>...</tbody>
</table>
```

#### Design
- **Header**: Light gray background (`--bg-secondary`)
- **Header Text**: Uppercase, small font, gray color, letter-spacing
- **Rows**: White background, hover state (light gray)
- **Borders**: Bottom border on cells (`--border-color`)
- **Padding**: `1rem` on all sides of cells

#### Responsive
- **Container**: `overflow-x: auto` for horizontal scroll on mobile
- **Table**: Full width, no wrapping

---

### 4. Buttons

#### Button Variants

**Primary Button** (`.btn-primary`)
- **Color**: Blue background (`--primary-color`), white text
- **Hover**: Darker blue (`--primary-hover`)
- **Use**: Main actions (Save, Search, Login)

**Secondary Button** (`.btn-secondary`)
- **Color**: Light gray background (`--bg-tertiary`), dark text
- **Border**: Light gray border
- **Hover**: Slightly darker gray
- **Use**: Secondary actions (Cancel, Refresh, Logout)

**Warning Button** (`.btn-warning`)
- **Color**: Orange background (`--warning-color`), white text
- **Use**: Warning actions (Flag as Inactive)

**Danger Button** (`.btn-danger`)
- **Color**: Red background (`--danger-color`), white text
- **Use**: Destructive actions (Delete)

#### Button States
- **Disabled**: `opacity: 0.5`, `cursor: not-allowed`
- **Hover**: Darker/lighter background (depending on variant)
- **Active**: Slight opacity change

#### Button Sizes
- **Default**: `padding: 0.5rem 1rem`
- **Block**: `.btn-block` - Full width (`width: 100%`)

---

### 5. Form Elements

#### Input Fields
- **Style**: Full width, padding `1rem`
- **Border**: Light gray (`--border-color`), `1px solid`
- **Border Radius**: `8px`
- **Focus State**: Blue border + blue shadow ring (`rgba(37, 99, 235, 0.1)`)
- **Font**: Inherits from body

#### Textarea
- **Style**: Same as input, but `resize: vertical`
- **Min Height**: `80px`

#### Labels
- **Style**: Block display, margin-bottom `0.5rem`
- **Font**: Medium weight (`500`), dark color
- **Size**: `0.9375rem`

#### Form Groups
- **Spacing**: `margin-bottom: 1.5rem` between groups
- **Layout**: Vertical stack by default

#### Form Rows
- **Layout**: CSS Grid, 2 columns (responsive: 1 column on mobile)
- **Gap**: `1.5rem` between columns

---

### 6. Search Section

#### Structure
```html
<div class="search-section">
  <input class="search-input" />
  <button class="btn-primary">Search</button>
</div>
```

#### Design
- **Layout**: Horizontal flex, input takes remaining space
- **Input**: Full width (`flex: 1`), standard input styling
- **Button**: Fixed width, primary button style
- **Responsive**: Stacks vertically on mobile

---

### 7. Search Results

#### Structure
```html
<div class="search-results">
  <div class="result-item">...</div>
</div>
```

#### Design
- **Container**: White card with border and shadow
- **Items**: List of clickable items
- **Hover**: Light gray background
- **Borders**: Bottom border between items (last item has no border)

---

### 8. User Details Card

#### Structure
```html
<div class="user-details">
  <div class="user-info-grid">...</div>
  <div class="enrolled-courses">...</div>
  <div class="action-buttons">...</div>
</div>
```

#### Design
- **Container**: White card with border and shadow
- **Info Grid**: CSS Grid, responsive columns (min 200px)
- **Sections**: Separated by top borders
- **Info Items**: Label + value pairs, vertical stack

---

### 9. Banner Management Form

#### Structure
```html
<div class="banner-item">
  <div class="banner-header">...</div>
  <form>...</form>
</div>
```

#### Design
- **Container**: White card with border and shadow
- **Header**: Horizontal flex, title + status badge
- **Form**: Standard form styling
- **Actions**: Horizontal button group at bottom

#### Status Badge
- **Active**: Green background (`--success-color`), white text
- **Inactive**: Gray background (`--text-muted`), white text
- **Style**: Rounded (`border-radius: 12px`), uppercase, small font

---

### 10. Loading Overlay

#### Structure
```html
<div class="loading-overlay">
  <div class="loading-spinner"></div>
  <p>Loading...</p>
</div>
```

#### Design
- **Position**: Fixed, covers entire viewport
- **Background**: Semi-transparent black (`rgba(0, 0, 0, 0.5)`)
- **Content**: Centered flex column
- **Spinner**: CSS animation (rotating border)
- **Z-index**: `9999` (above all content)

---

### 11. Toast Notifications

#### Structure
```html
<div class="toast">Message</div>
```

#### Design
- **Position**: Fixed, bottom-right corner
- **Background**: Dark (`--text-primary`) by default
- **Variants**: `.success` (green), `.error` (red), `.warning` (orange)
- **Animation**: Slide up + fade in
- **Shadow**: Large shadow for depth
- **Z-index**: `10000` (above overlay)

---

## 🎯 Interactive Elements

### Tab Navigation
- **Click**: Switches active tab
- **Active State**: Blue text + blue bottom border
- **Hover**: Light gray background
- **Transition**: Smooth color/border transitions (`0.2s`)

### Period Buttons (Chart Controls)
- **Click**: Switches between Daily/Weekly
- **Active State**: Blue background, white text
- **Default State**: Light gray background, dark text
- **Hover**: Slightly darker gray

### Search Results
- **Click**: Selects user, shows details
- **Hover**: Light gray background
- **Cursor**: Pointer on hover

### Form Inputs
- **Focus**: Blue border + blue shadow ring
- **Transition**: Smooth border/shadow changes (`0.2s`)

### Buttons
- **Hover**: Background color change
- **Disabled**: Reduced opacity, no pointer cursor
- **Transition**: Smooth background changes (`0.2s`)

---

## 📱 Responsive Design

### Breakpoint
- **Mobile**: `@media (max-width: 768px)`

### Mobile Adaptations

#### Header
- **Layout**: Stacks vertically (flex-direction: column)
- **Alignment**: Left-aligned items

#### Tab Navigation
- **Scroll**: Horizontal scroll enabled (`overflow-x: auto`)
- **Touch**: Smooth scrolling (`-webkit-overflow-scrolling: touch`)

#### Main Content
- **Padding**: Reduced to `1rem` (from `2rem`)

#### Statistics Grid
- **Columns**: Single column (`grid-template-columns: 1fr`)

#### Form Rows
- **Columns**: Single column (stacks vertically)

#### Search Section
- **Layout**: Stacks vertically (`flex-direction: column`)

#### Action Buttons
- **Layout**: Stacks vertically

---

## 🏗️ CSS Architecture

### File Structure
```
css/
├── normalize.css    # CSS reset (cross-browser consistency)
└── backoffice.css   # Main stylesheet
```

### CSS Organization (in `backoffice.css`)
1. **CSS Variables** (`:root`) - Colors, spacing, shadows
2. **Base Styles** - Body, container, typography
3. **Layout Components** - Header, navigation, main content
4. **Page-Specific** - Login, dashboard sections
5. **Reusable Components** - Cards, buttons, forms, tables
6. **Utility Classes** - Loading, toast, overlays
7. **Responsive** - Media queries at the end

### Naming Convention
- **BEM-like**: Component-based class names
- **Semantic**: Class names describe purpose, not appearance
- **Examples**:
  - `.backoffice-container` - Main container
  - `.stat-card` - Statistics card component
  - `.btn-primary` - Primary button variant
  - `.tab-content.active` - Active state modifier

### CSS Variables Usage
- **All colors**: Defined as variables (easy theming)
- **All spacing**: Defined as variables (consistent spacing)
- **All shadows**: Defined as variables (consistent depth)
- **Border radius**: Single variable (`--border-radius: 8px`)

---

## 🎨 Visual Hierarchy

### Size Hierarchy
1. **H1** (Header title) - Largest
2. **H2** (Tab headers) - Large
3. **H3** (Section titles) - Medium
4. **Body** - Default
5. **Small** (Labels) - Smaller

### Color Hierarchy
1. **Primary Text** - Dark gray (most important)
2. **Secondary Text** - Medium gray (less important)
3. **Muted Text** - Light gray (least important)

### Spacing Hierarchy
- **Large Gaps**: Between major sections (`--spacing-xl`)
- **Medium Gaps**: Between cards, form groups (`--spacing-lg`)
- **Small Gaps**: Between related items (`--spacing-md`)
- **Tiny Gaps**: Within components (`--spacing-sm`)

---

## 🔍 Key Design Decisions

### Why No External Libraries?
- **Performance**: Faster load times, smaller bundle
- **Control**: Full control over styling
- **Simplicity**: Easier to maintain and customize
- **Dependencies**: No external dependencies to manage

### Why CSS Variables?
- **Theming**: Easy to change colors/spacing globally
- **Consistency**: Ensures consistent values across components
- **Maintainability**: Single source of truth for design tokens

### Why Simple Charts?
- **No Dependencies**: Pure CSS/HTML implementation
- **Lightweight**: No Chart.js or similar libraries
- **Customizable**: Full control over appearance
- **MVP Approach**: Good enough for initial version

### Why System Fonts?
- **Performance**: No font loading delay
- **Native Feel**: Matches OS appearance
- **Accessibility**: Users familiar with their system fonts
- **Fallback**: Progressive enhancement with fallback chain

### Why Fixed Max-Width?
- **Readability**: Prevents overly wide layouts on large screens
- **Centered**: Professional centered layout
- **Consistency**: Same width across all pages

---

## 📋 Component Checklist

When redesigning, ensure these components are updated:

- [ ] Login page layout and styling
- [ ] Header (title, user info, logout)
- [ ] Tab navigation
- [ ] Stat cards
- [ ] Chart section (controls + chart)
- [ ] Tables (headers, rows, hover)
- [ ] Buttons (all variants)
- [ ] Form inputs (text, textarea, checkbox, datetime)
- [ ] Search section
- [ ] Search results
- [ ] User details card
- [ ] Banner management form
- [ ] Loading overlay
- [ ] Toast notifications
- [ ] Responsive breakpoints

---

## 🎯 Design Principles to Maintain

1. **Consistency**: Same styling patterns across all components
2. **Accessibility**: High contrast, readable fonts, focus states
3. **Performance**: Minimal CSS, no heavy libraries
4. **Responsiveness**: Mobile-friendly layouts
5. **Clarity**: Clear visual hierarchy, organized information
6. **Functionality**: Design supports task completion, not decoration

---

## 📝 Notes for Redesign

When redesigning to match PMHelp's theme:

1. **Replace Color Variables**: Update CSS variables with PMHelp brand colors
2. **Update Typography**: Use PMHelp's font family if different
3. **Maintain Structure**: Keep the same HTML structure and class names
4. **Preserve Functionality**: Don't break JavaScript by changing class names
5. **Enhance Visuals**: Add PMHelp-specific styling (gradients, icons, etc.)
6. **Keep Responsive**: Maintain mobile-friendly breakpoints
7. **Test Components**: Verify all interactive elements still work

---

**Last Updated**: After initial implementation
**Purpose**: Design reference for PMHelp theme redesign
