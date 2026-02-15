# Multi-System Design System

## Overview

This is a comprehensive design system that supports three independent systems with unified design tokens and theme switching capabilities.

## Architecture

```
Design System Core
├── Shared Design Tokens
│   ├── Typography (fonts, sizes, weights, line heights)
│   ├── Spacing (8px grid system)
│   ├── Border Radius
│   ├── Shadows
│   └── Animation
├── Theme Layer (CSS Variables)
│   ├── Website Theme (Deep Blue #1E3A5F)
│   ├── Enterprise Admin Theme (Dark Gray #495057)
│   └── User Portal Theme (Teal #14B8A6)
└── Component Library (Theme-Aware)
    ├── Button
    ├── Input
    ├── Card
    └── More components...
```

## File Structure

```
styles/design-system/
├── tokens/
│   ├── typography.css      # Font families, sizes, weights, line heights
│   ├── spacing.css         # 8px grid system
│   ├── border-radius.css   # Border radius values
│   ├── shadows.css         # Shadow definitions
│   └── animation.css       # Transitions and animations
├── themes/
│   ├── website-theme.css           # Website system colors
│   ├── enterprise-admin-theme.css  # Enterprise admin system colors
│   └── user-portal-theme.css       # User portal system colors
├── globals.css             # Main entry point
└── README.md              # This file
```

## Usage

### 1. Import Design System

Add the design system to your main CSS file or layout:

```css
@import 'styles/design-system/globals.css';
```

Or in your Next.js layout:

```tsx
import 'styles/design-system/globals.css';
```

### 2. Set Up Theme Provider

Wrap your app with the ThemeProvider:

```tsx
import { ThemeProvider } from '@/lib/theme/theme-provider';

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
```

### 3. Use Theme Hook

Access theme in your components:

```tsx
import { useTheme } from '@/lib/theme/theme-provider';

export function ThemeSwitcher() {
  const { theme, mode, setTheme, setMode, isDark } = useTheme();

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
        <option value="website">Website</option>
        <option value="enterprise-admin">Enterprise Admin</option>
        <option value="user-portal">User Portal</option>
      </select>

      <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}
```

### 4. Use Design System Components

```tsx
import { Button, Input, Card, CardHeader, CardBody } from '@/components/design-system';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <h2>Welcome</h2>
      </CardHeader>
      <CardBody>
        <Input label="Name" placeholder="Enter your name" />
        <Button variant="primary">Submit</Button>
      </CardBody>
    </Card>
  );
}
```

## Design Tokens

### Typography

```css
--font-family-base: System fonts
--font-family-mono: Monaco, Courier New

--font-size-xs: 12px
--font-size-sm: 14px
--font-size-base: 16px
--font-size-lg: 18px
--font-size-xl: 20px
--font-size-2xl: 24px
--font-size-3xl: 32px

--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700

--line-height-tight: 1.2
--line-height-normal: 1.5
--line-height-relaxed: 1.75
```

### Spacing (8px Grid)

```css
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
--spacing-3xl: 64px
```

### Border Radius

```css
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-2xl: 20px
--radius-full: 9999px
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### Animation

```css
--transition-fast: 150ms
--transition-base: 200ms
--transition-slow: 300ms

--easing-in: cubic-bezier(0.4, 0, 1, 1)
--easing-out: cubic-bezier(0, 0, 0.2, 1)
--easing-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

## Themes

### Website Theme (Deep Blue)

Primary Color: `#1E3A5F`

- Professional, trustworthy, stable
- Used for public-facing website
- Light and dark mode support

### Enterprise Admin Theme (Dark Gray)

Primary Color: `#495057`

- Serious, efficient, professional
- Used for internal management systems
- Light and dark mode support

### User Portal Theme (Teal)

Primary Color: `#14B8A6`

- Friendly, vibrant, easy to use
- Used for user self-service systems
- Light and dark mode support

## Components

### Button

```tsx
<Button variant="primary" size="md">
  Click me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- `disabled`: boolean

### Input

```tsx
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="Invalid email"
  helperText="We'll never share your email"
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `fullWidth`: boolean
- All standard HTML input attributes

### Card

```tsx
<Card hoverable>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Props:**
- `hoverable`: boolean
- `clickable`: boolean

## Accessibility

- All components support keyboard navigation
- Focus states are clearly visible
- Color contrast meets WCAG AA standards
- Semantic HTML is used throughout
- ARIA labels are included where necessary

## Dark Mode

The design system automatically supports dark mode:

1. **System Preference**: Respects user's OS dark mode setting
2. **Manual Override**: Users can manually switch themes
3. **Persistence**: Theme preference is saved to localStorage
4. **Smooth Transitions**: Color changes are animated

## Responsive Design

The design system is mobile-first and responsive:

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Best Practices

1. **Use CSS Variables**: Always use design tokens instead of hardcoded values
2. **Consistent Spacing**: Use the 8px grid system for all spacing
3. **Theme Aware**: Components automatically adapt to the current theme
4. **Accessibility**: Always include labels and ARIA attributes
5. **Performance**: Minimize CSS specificity and use CSS variables for dynamic values

## Extending the Design System

### Adding a New Component

1. Create a new component file in `components/design-system/`
2. Create a corresponding CSS module
3. Use design tokens for all styling
4. Export from `components/design-system/index.ts`

### Adding a New Theme

1. Create a new theme file in `styles/design-system/themes/`
2. Define all color variables for light and dark modes
3. Import in `styles/design-system/globals.css`
4. Update `ThemeProvider` to support the new theme

### Adding New Design Tokens

1. Add tokens to the appropriate file in `styles/design-system/tokens/`
2. Import in `styles/design-system/globals.css`
3. Use in components and styles

## Testing

The design system includes property-based tests to verify:

1. **Theme Consistency**: All colors are correctly applied
2. **Color Contrast**: All color combinations meet WCAG AA standards
3. **Theme Switching**: Switching themes works correctly
4. **Component Adaptation**: Components adapt to theme changes
5. **Token Inheritance**: All components receive the same token values
6. **Responsive Design**: Components render correctly at all breakpoints
7. **Dark Mode Readability**: Text is readable in dark mode
8. **Brand Identity**: Visual hierarchy and brand recognition are maintained

## Support

For issues or questions about the design system, please refer to:

- `.kiro/specs/multi-system-design-system/` - Design specifications
- `.kiro/specs/website-system/` - Website system specifications
- `.kiro/specs/enterprise-admin-system/` - Enterprise admin system specifications
- `.kiro/specs/user-portal-system/` - User portal system specifications
