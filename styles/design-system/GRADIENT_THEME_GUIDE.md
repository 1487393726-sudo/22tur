# Gradient Theme Guide

## Overview

The Gradient Theme System is a modern, flexible theming solution for the Enterprise Admin System that provides beautiful gradient effects across UI elements. This guide explains how to use gradient utility classes, switch between gradient themes, and extend the system with new themes.

### Key Features

- **Two Built-in Gradient Themes**: Blue-Purple (default) and Purple-Pink (alternative)
- **Light & Dark Mode Support**: Optimized colors for both light and dark backgrounds
- **CSS Variables**: Easy customization and dynamic theme switching
- **Utility Classes**: Simple, semantic classes for applying gradients
- **Smooth Transitions**: 300ms transitions with cubic-bezier easing
- **Accessibility**: WCAG AA compliant contrast ratios
- **Extensible**: Add new gradient themes without modifying code

---

## Table of Contents

1. [Available Gradient Themes](#available-gradient-themes)
2. [Gradient Utility Classes](#gradient-utility-classes)
3. [Usage Examples](#usage-examples)
4. [CSS Variables Reference](#css-variables-reference)
5. [Switching Gradient Themes Programmatically](#switching-gradient-themes-programmatically)
6. [Adding New Gradient Themes](#adding-new-gradient-themes)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Available Gradient Themes

### 1. Blue-Purple Gradient (Default)

The default gradient theme, recommended for enterprise applications.

**Characteristics:**
- Professional and modern appearance
- Stable and trustworthy feel
- Excellent contrast in both light and dark modes

**Colors:**

| Mode | Start Color | End Color | Hex Values |
|------|-------------|-----------|-----------|
| Light | Blue | Purple | #2563eb → #9333ea |
| Dark | Light Blue | Light Purple | #60a5fa → #c084fc |

**Visual Example:**
```
Light Mode:  [████████████████] (Blue to Purple)
Dark Mode:   [████████████████] (Light Blue to Light Purple)
```

**Use Cases:**
- Dashboard headers
- Primary action buttons
- Important metrics and KPIs
- Navigation elements
- Section dividers

### 2. Purple-Pink Gradient (Alternative)

An alternative gradient theme with a more vibrant, creative feel.

**Characteristics:**
- Vibrant and energetic appearance
- Creative and friendly feel
- Good for highlighting secondary actions

**Colors:**

| Mode | Start Color | End Color | Hex Values |
|------|-------------|-----------|-----------|
| Light | Purple | Pink | #9333ea → #db2777 |
| Dark | Light Purple | Light Pink | #c084fc → #ec4899 |

**Visual Example:**
```
Light Mode:  [████████████████] (Purple to Pink)
Dark Mode:   [████████████████] (Light Purple to Light Pink)
```

**Use Cases:**
- Secondary action buttons
- Accent elements
- Promotional sections
- Interactive highlights
- Status indicators

---

## Gradient Utility Classes

The gradient theme system provides three main utility classes for applying gradients to different elements.

### 1. `.theme-gradient-bg` - Background Gradient

Applies a gradient background to an element.

**HTML:**
```html
<div class="theme-gradient-bg">
  Gradient Background
</div>
```

**CSS:**
```css
.theme-gradient-bg {
  background: var(--gradient-bg);
  transition: background 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Features:**
- Applies gradient to the entire background
- Smooth 300ms transition on mode/theme changes
- Works with all element types
- Supports hover and focus states

**Common Use Cases:**
- Page headers and hero sections
- Card backgrounds
- Button backgrounds
- Section dividers
- Accent backgrounds

### 2. `.theme-gradient-text` - Text Gradient

Applies a gradient effect to text content.

**HTML:**
```html
<h1 class="theme-gradient-text">
  Gradient Text
</h1>
```

**CSS:**
```css
.theme-gradient-text {
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: background 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Features:**
- Creates gradient text effect using background-clip
- Cross-browser compatible with fallbacks
- Smooth transitions between themes
- Maintains text selectability

**Common Use Cases:**
- Page titles and headings
- Emphasis text
- Important labels
- Brand text
- Call-to-action text

### 3. `.theme-gradient-border` - Border Gradient

Applies a gradient effect to element borders.

**HTML:**
```html
<div class="theme-gradient-border">
  Gradient Border
</div>
```

**CSS:**
```css
.theme-gradient-border {
  position: relative;
  border: 2px solid transparent;
  background-image: 
    linear-gradient(var(--color-bg-primary), var(--color-bg-primary)),
    var(--gradient-border);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  transition: background 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Features:**
- Creates gradient border using background-clip technique
- Maintains element's background color
- Works with any border width
- Smooth transitions between themes

**Common Use Cases:**
- Card borders
- Input field focus states
- Container borders
- Highlighted sections
- Form field borders

---

## Usage Examples

### Example 1: Dashboard Header with Gradient Background

```html
<header class="theme-gradient-bg p-6 text-white">
  <h1 class="text-3xl font-bold">Dashboard</h1>
  <p class="text-sm opacity-90">Welcome back, Admin</p>
</header>
```

**Result:** A header with a gradient background (blue to purple in light mode, light blue to light purple in dark mode).

### Example 2: Gradient Text for Page Title

```html
<div class="mb-8">
  <h1 class="theme-gradient-text text-4xl font-bold">
    Enterprise Analytics
  </h1>
  <p class="text-gray-600 mt-2">
    Real-time insights and metrics
  </p>
</div>
```

**Result:** A page title with gradient text effect.

### Example 3: Card with Gradient Border

```html
<div class="theme-gradient-border p-6 rounded-lg bg-white">
  <h2 class="text-xl font-semibold mb-4">Key Metrics</h2>
  <div class="grid grid-cols-3 gap-4">
    <div class="text-center">
      <p class="text-3xl font-bold">1,234</p>
      <p class="text-sm text-gray-600">Total Users</p>
    </div>
    <div class="text-center">
      <p class="text-3xl font-bold">567</p>
      <p class="text-sm text-gray-600">Active Sessions</p>
    </div>
    <div class="text-center">
      <p class="text-3xl font-bold">89%</p>
      <p class="text-sm text-gray-600">Engagement Rate</p>
    </div>
  </div>
</div>
```

**Result:** A card with a gradient border containing key metrics.

### Example 4: Gradient Button

```html
<button class="theme-gradient-bg text-white font-semibold py-2 px-6 rounded-lg hover:shadow-lg transition-shadow">
  Create New User
</button>
```

**Result:** A button with gradient background that responds to hover state.

### Example 5: Form Label with Gradient Text

```html
<form class="space-y-6">
  <div>
    <label class="theme-gradient-text block text-sm font-semibold mb-2">
      Email Address
    </label>
    <input 
      type="email" 
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:theme-gradient-border focus:outline-none"
      placeholder="user@example.com"
    />
  </div>
  
  <div>
    <label class="theme-gradient-text block text-sm font-semibold mb-2">
      Password
    </label>
    <input 
      type="password" 
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:theme-gradient-border focus:outline-none"
      placeholder="••••••••"
    />
  </div>
  
  <button class="theme-gradient-bg text-white font-semibold py-2 px-6 rounded-lg w-full">
    Sign In
  </button>
</form>
```

**Result:** A form with gradient labels and a gradient submit button.

### Example 6: Navigation Menu with Gradient

```html
<nav class="theme-gradient-bg text-white">
  <div class="max-w-7xl mx-auto px-6 py-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Admin Panel</h1>
      <ul class="flex space-x-6">
        <li><a href="#" class="hover:opacity-80">Dashboard</a></li>
        <li><a href="#" class="hover:opacity-80">Users</a></li>
        <li><a href="#" class="hover:opacity-80">Settings</a></li>
      </ul>
    </div>
  </div>
</nav>
```

**Result:** A navigation bar with gradient background.

### Example 7: Status Badge with Gradient

```html
<div class="inline-block theme-gradient-bg text-white text-xs font-semibold px-3 py-1 rounded-full">
  Active
</div>
```

**Result:** A status badge with gradient background.

### Example 8: Combining Multiple Gradient Classes

```html
<section class="theme-gradient-bg p-8 rounded-lg">
  <h2 class="theme-gradient-text text-3xl font-bold mb-4">
    Featured Section
  </h2>
  <div class="theme-gradient-border p-6 bg-white rounded-lg mt-6">
    <p class="text-gray-700">
      This section combines gradient background, gradient text, and gradient border for maximum visual impact.
    </p>
  </div>
</section>
```

**Result:** A section that uses all three gradient utility classes together.

---

## CSS Variables Reference

The gradient theme system uses CSS variables to manage all gradient definitions. These variables are automatically set based on the current theme and mode.

### Primary Gradient Variables

These variables are used by the utility classes and automatically switch between light and dark modes.

```css
/* Responsive gradient variables (automatically switch based on mode) */
--gradient-bg              /* Current gradient background */
--gradient-text            /* Current gradient text */
--gradient-border          /* Current gradient border */
--gradient-start           /* Current gradient start color */
--gradient-end             /* Current gradient end color */
--gradient-start-rgb       /* Current gradient start color (RGB) */
--gradient-end-rgb         /* Current gradient end color (RGB) */
```

### Light Mode Variables

Used when the system is in light mode.

```css
/* Blue-Purple Gradient - Light Mode */
--gradient-start-light: #2563eb;
--gradient-end-light: #9333ea;
--gradient-start-rgb-light: 37, 99, 235;
--gradient-end-rgb-light: 147, 51, 234;
--gradient-bg-light: linear-gradient(135deg, #2563eb, #9333ea);
--gradient-text-light: linear-gradient(135deg, #2563eb, #9333ea);
--gradient-border-light: linear-gradient(135deg, #2563eb, #9333ea);

/* Transparency Variants (10% - 90%) */
--gradient-bg-light-10: rgba(37, 99, 235, 0.1);
--gradient-bg-light-20: rgba(37, 99, 235, 0.2);
/* ... up to --gradient-bg-light-90 */
```

### Dark Mode Variables

Used when the system is in dark mode.

```css
/* Blue-Purple Gradient - Dark Mode */
--gradient-start-dark: #60a5fa;
--gradient-end-dark: #c084fc;
--gradient-start-rgb-dark: 96, 165, 250;
--gradient-end-rgb-dark: 192, 132, 252;
--gradient-bg-dark: linear-gradient(135deg, #60a5fa, #c084fc);
--gradient-text-dark: linear-gradient(135deg, #60a5fa, #c084fc);
--gradient-border-dark: linear-gradient(135deg, #60a5fa, #c084fc);

/* Transparency Variants (10% - 90%) */
--gradient-bg-dark-10: rgba(96, 165, 250, 0.1);
--gradient-bg-dark-20: rgba(96, 165, 250, 0.2);
/* ... up to --gradient-bg-dark-90 */
```

### Alternative Gradient Variables

Used for the Purple-Pink gradient theme.

```css
/* Purple-Pink Gradient - Light Mode */
--gradient-alt-start-light: #9333ea;
--gradient-alt-end-light: #db2777;
--gradient-alt-bg-light: linear-gradient(135deg, #9333ea, #db2777);
--gradient-alt-text-light: linear-gradient(135deg, #9333ea, #db2777);
--gradient-alt-border-light: linear-gradient(135deg, #9333ea, #db2777);

/* Purple-Pink Gradient - Dark Mode */
--gradient-alt-start-dark: #c084fc;
--gradient-alt-end-dark: #ec4899;
--gradient-alt-bg-dark: linear-gradient(135deg, #c084fc, #ec4899);
--gradient-alt-text-dark: linear-gradient(135deg, #c084fc, #ec4899);
--gradient-alt-border-dark: linear-gradient(135deg, #c084fc, #ec4899);
```

### Transition Variables

Control the animation behavior of gradient transitions.

```css
--gradient-transition-duration: 300ms;
--gradient-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
--gradient-transition: background 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Using CSS Variables in Custom Styles

You can use these variables in your own CSS:

```css
/* Using gradient background */
.my-custom-element {
  background: var(--gradient-bg);
  transition: background var(--gradient-transition-duration) var(--gradient-transition-timing);
}

/* Using gradient text */
.my-custom-text {
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Using gradient colors with transparency */
.my-custom-overlay {
  background-color: rgba(var(--gradient-start-rgb), 0.5);
}

/* Using individual color values */
.my-custom-border {
  border-color: var(--gradient-start);
}
```

---

## Switching Gradient Themes Programmatically

The gradient theme system provides a React hook for switching themes programmatically.

### Using the `useGradientTheme` Hook

```tsx
import { useGradientTheme } from '@/lib/theme/use-gradient-theme';

export function GradientThemeSwitcher() {
  const { gradientTheme, setGradientTheme, availableThemes } = useGradientTheme();

  return (
    <div>
      <label htmlFor="theme-select">Select Gradient Theme:</label>
      <select 
        id="theme-select"
        value={gradientTheme} 
        onChange={(e) => setGradientTheme(e.target.value as any)}
      >
        {availableThemes.map((theme) => (
          <option key={theme} value={theme}>
            {theme.charAt(0).toUpperCase() + theme.slice(1).replace('-', ' ')}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### Using the Theme Provider Context

```tsx
import { useTheme } from '@/lib/theme/theme-provider';

export function ThemeSettings() {
  const { gradientTheme, setGradientTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setGradientTheme(newTheme as any);
    // Theme is automatically applied to all elements
    // No page refresh needed
  };

  return (
    <div>
      <button onClick={() => handleThemeChange('blue-purple')}>
        Blue-Purple Theme
      </button>
      <button onClick={() => handleThemeChange('purple-pink')}>
        Purple-Pink Theme
      </button>
    </div>
  );
}
```

### Theme Persistence

The selected gradient theme is automatically saved to localStorage and restored on page reload:

```tsx
// Theme is automatically persisted
const { gradientTheme, setGradientTheme } = useTheme();

// When user changes theme
setGradientTheme('purple-pink');

// On next page load, 'purple-pink' theme is automatically restored
```

### Detecting Current Theme

```tsx
import { useTheme } from '@/lib/theme/theme-provider';

export function ThemeIndicator() {
  const { gradientTheme, isDark } = useTheme();

  return (
    <div>
      <p>Current Theme: {gradientTheme}</p>
      <p>Mode: {isDark ? 'Dark' : 'Light'}</p>
    </div>
  );
}
```

---

## Adding New Gradient Themes

The gradient theme system is designed to be extensible. You can add new gradient themes without modifying the code.

### Step 1: Update the Theme Configuration File

Edit `public/theme-config.json` and add your new gradient theme:

```json
{
  "gradientThemes": {
    "blue-purple": {
      "light": {
        "start": "#2563eb",
        "end": "#9333ea",
        "startRgb": "37, 99, 235",
        "endRgb": "147, 51, 234"
      },
      "dark": {
        "start": "#60a5fa",
        "end": "#c084fc",
        "startRgb": "96, 165, 250",
        "endRgb": "192, 132, 252"
      }
    },
    "purple-pink": {
      "light": {
        "start": "#9333ea",
        "end": "#db2777",
        "startRgb": "147, 51, 234",
        "endRgb": "219, 39, 119"
      },
      "dark": {
        "start": "#c084fc",
        "end": "#ec4899",
        "startRgb": "192, 132, 252",
        "endRgb": "236, 72, 153"
      }
    },
    "green-teal": {
      "light": {
        "start": "#10b981",
        "end": "#14b8a6",
        "startRgb": "16, 185, 129",
        "endRgb": "20, 184, 166"
      },
      "dark": {
        "start": "#34d399",
        "end": "#2dd4bf",
        "startRgb": "52, 211, 153",
        "endRgb": "45, 212, 191"
      }
    }
  }
}
```

### Step 2: Verify the Configuration

The configuration will be automatically loaded when the application starts. You can verify it by:

1. Opening the browser console
2. Checking that no errors are logged
3. Using the theme switcher to select the new theme

### Step 3: Use the New Theme

Once added to the configuration, the new theme is immediately available:

```tsx
import { useGradientTheme } from '@/lib/theme/use-gradient-theme';

export function ThemeSwitcher() {
  const { availableThemes, setGradientTheme } = useGradientTheme();

  return (
    <div>
      {availableThemes.map((theme) => (
        <button 
          key={theme}
          onClick={() => setGradientTheme(theme as any)}
        >
          {theme}
        </button>
      ))}
    </div>
  );
}
```

### Configuration Format

Each gradient theme must follow this structure:

```json
{
  "themeName": {
    "light": {
      "start": "#RRGGBB",           // Hex color for light mode start
      "end": "#RRGGBB",             // Hex color for light mode end
      "startRgb": "R, G, B",        // RGB values for transparency
      "endRgb": "R, G, B"           // RGB values for transparency
    },
    "dark": {
      "start": "#RRGGBB",           // Hex color for dark mode start
      "end": "#RRGGBB",             // Hex color for dark mode end
      "startRgb": "R, G, B",        // RGB values for transparency
      "endRgb": "R, G, B"           // RGB values for transparency
    }
  }
}
```

### Color Selection Guidelines

When creating new gradient themes, follow these guidelines:

1. **Contrast**: Ensure sufficient contrast between start and end colors
2. **Accessibility**: Test with WCAG AA contrast ratio checker
3. **Light Mode**: Use darker, more saturated colors
4. **Dark Mode**: Use lighter, less saturated colors
5. **Consistency**: Maintain similar hue relationships between light and dark modes
6. **Brand Alignment**: Choose colors that align with your brand identity

### Example: Creating a Red-Orange Gradient

```json
{
  "red-orange": {
    "light": {
      "start": "#dc2626",
      "end": "#f97316",
      "startRgb": "220, 38, 38",
      "endRgb": "249, 115, 22"
    },
    "dark": {
      "start": "#ef4444",
      "end": "#fb923c",
      "startRgb": "239, 68, 68",
      "endRgb": "251, 146, 60"
    }
  }
}
```

---

## Best Practices

### 1. Use Semantic Utility Classes

Always use the appropriate utility class for the element type:

```html
<!-- ✓ Good: Using semantic classes -->
<h1 class="theme-gradient-text">Title</h1>
<button class="theme-gradient-bg">Action</button>
<div class="theme-gradient-border">Card</div>

<!-- ✗ Avoid: Mixing classes incorrectly -->
<h1 class="theme-gradient-bg">Title</h1>
<button class="theme-gradient-text">Action</button>
```

### 2. Maintain Sufficient Contrast

Ensure text remains readable when using gradient effects:

```html
<!-- ✓ Good: High contrast text on gradient background -->
<div class="theme-gradient-bg text-white font-semibold">
  Important Message
</div>

<!-- ✗ Avoid: Low contrast text -->
<div class="theme-gradient-bg text-gray-400">
  Hard to read
</div>
```

### 3. Don't Overuse Gradients

Use gradients strategically to highlight important elements:

```html
<!-- ✓ Good: Gradients on key elements -->
<header class="theme-gradient-bg">Header</header>
<button class="theme-gradient-bg">Primary Action</button>

<!-- ✗ Avoid: Gradients everywhere -->
<p class="theme-gradient-text">Regular paragraph</p>
<span class="theme-gradient-bg">Small text</span>
<a class="theme-gradient-border">Link</a>
```

### 4. Test in Both Light and Dark Modes

Always verify that gradients look good in both modes:

```tsx
export function ComponentPreview() {
  const { mode, setMode } = useTheme();

  return (
    <div>
      <button onClick={() => setMode('light')}>Light Mode</button>
      <button onClick={() => setMode('dark')}>Dark Mode</button>
      
      <div class="theme-gradient-bg p-6">
        Check appearance in both modes
      </div>
    </div>
  );
}
```

### 5. Use CSS Variables for Custom Styling

When creating custom styles, use CSS variables instead of hardcoding colors:

```css
/* ✓ Good: Using CSS variables */
.custom-element {
  background: var(--gradient-bg);
  border-color: var(--gradient-start);
  transition: background var(--gradient-transition);
}

/* ✗ Avoid: Hardcoding colors */
.custom-element {
  background: linear-gradient(135deg, #2563eb, #9333ea);
  border-color: #2563eb;
}
```

### 6. Provide Fallbacks for Unsupported Browsers

Use CSS @supports for graceful degradation:

```css
@supports (background-clip: text) {
  .theme-gradient-text {
    background: var(--gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

@supports not (background-clip: text) {
  .theme-gradient-text {
    color: var(--gradient-start);
  }
}
```

### 7. Respect User Preferences

Respect user's motion and contrast preferences:

```css
/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  .theme-gradient-bg,
  .theme-gradient-text,
  .theme-gradient-border {
    transition: none;
  }
}

/* Increase contrast for users who prefer it */
@media (prefers-contrast: more) {
  .theme-gradient-bg {
    filter: contrast(1.2);
  }
}
```

---

## Troubleshooting

### Issue: Gradient Not Appearing

**Possible Causes:**
1. CSS file not imported
2. CSS variables not defined
3. Browser doesn't support gradients

**Solutions:**
```tsx
// 1. Ensure CSS is imported in your layout
import 'styles/design-system/globals.css';

// 2. Check that theme provider is wrapping your app
<ThemeProvider>
  <YourApp />
</ThemeProvider>

// 3. Verify CSS variables are set
console.log(getComputedStyle(document.documentElement).getPropertyValue('--gradient-bg'));
```

### Issue: Gradient Text Not Visible

**Possible Causes:**
1. Text color not transparent
2. Background-clip not supported
3. Text too small to see gradient

**Solutions:**
```html
<!-- Ensure text is large enough to see gradient -->
<h1 class="theme-gradient-text text-4xl font-bold">
  Visible Gradient Text
</h1>

<!-- Use fallback color for unsupported browsers -->
<style>
  .theme-gradient-text {
    color: var(--gradient-start); /* Fallback */
    background: var(--gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
</style>
```

### Issue: Gradient Border Not Showing

**Possible Causes:**
1. Border width too small
2. Background color covering border
3. Position not relative

**Solutions:**
```html
<!-- Ensure sufficient border width -->
<div class="theme-gradient-border" style="border-width: 3px;">
  Content
</div>

<!-- Ensure background color is set -->
<div class="theme-gradient-border bg-white">
  Content
</div>

<!-- Ensure position is relative -->
<div class="theme-gradient-border relative">
  Content
</div>
```

### Issue: Theme Not Persisting

**Possible Causes:**
1. localStorage disabled
2. Private browsing mode
3. Theme provider not wrapping app

**Solutions:**
```tsx
// Ensure theme provider is at root level
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// Check localStorage availability
if (typeof window !== 'undefined' && window.localStorage) {
  // localStorage is available
}
```

### Issue: Gradient Looks Different in Dark Mode

**Possible Causes:**
1. Dark mode colors not optimized
2. Contrast ratio too low
3. Color values not adjusted for dark background

**Solutions:**
```json
{
  "my-theme": {
    "light": {
      "start": "#2563eb",
      "end": "#9333ea"
    },
    "dark": {
      "start": "#60a5fa",
      "end": "#c084fc"
    }
  }
}
```

Ensure dark mode colors are lighter and less saturated than light mode colors.

---

## Additional Resources

- **CSS Variables Reference**: See [CSS Variables Reference](#css-variables-reference)
- **Theme Configuration**: `public/theme-config.json`
- **Gradient Utilities**: `styles/design-system/utilities/gradient-utilities.css`
- **Gradient Theme CSS**: `styles/design-system/themes/gradient-theme.css`
- **Theme Provider**: `lib/theme/theme-provider.tsx`
- **Gradient Theme Hook**: `lib/theme/use-gradient-theme.ts`

---

## Support

For issues or questions about the gradient theme system:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Best Practices](#best-practices) section
3. Refer to the specification: `.kiro/specs/enterprise-admin-theme-redesign/`
4. Check the CSS files for implementation details

---

## Version History

- **v1.0.0** (Current)
  - Initial release
  - Blue-Purple and Purple-Pink gradient themes
  - Light and dark mode support
  - Three utility classes: background, text, border
  - CSS variables for customization
  - Theme persistence to localStorage
  - Extensible configuration system

