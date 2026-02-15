# Animation System

This directory contains Framer Motion animation variants and transition configurations for the 3D website redesign.

## Files

- **variants.ts**: Reusable animation variants for different animation types
- **transitions.ts**: Transition configurations and timing functions
- **index.ts**: Main entry point that exports all animations

## Features

### Basic Animations
- `fadeIn`, `fadeInUp`, `fadeInDown` - Fade animations with optional movement
- `slideInLeft`, `slideInRight`, `slideInTop`, `slideInBottom` - Slide animations from different directions
- `scaleIn`, `scaleInRotate` - Scale animations with optional rotation

### Card Interactions
- `cardHover` - 3D lift effect on hover
- `cardTap` - Scale down effect on tap/click
- `card3DTilt` - Dynamic 3D tilt based on mouse position
- `cardFlip` - 180-degree flip animation

### Stagger Animations
- `staggerContainer` - Container for staggered children
- `staggerItem` - Individual item animation in stagger
- `staggerItemScale` - Stagger item with scale effect

### Page Transitions
- `pageTransition` - Fade transition between pages
- `pageSlide` - Slide transition between pages

### Modal Animations
- `modalBackdrop` - Backdrop fade animation
- `modalContent` - Modal content slide and scale animation

### Mobile Optimizations
- `mobileFadeIn` - Faster fade for mobile
- `mobileSlideIn` - Reduced distance slide for mobile
- `mobileCardHover` - Minimal hover effect for mobile

## Usage

### Basic Usage

```tsx
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

function MyComponent() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      Content
    </motion.div>
  );
}
```

### Card with Hover Effect

```tsx
import { motion } from 'framer-motion';
import { cardHover } from '@/lib/animations';

function Card() {
  return (
    <motion.div
      variants={cardHover}
      initial="initial"
      whileHover="hover"
      className="card"
    >
      Card content
    </motion.div>
  );
}
```

### Stagger Animation

```tsx
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

function CardGrid({ items }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          variants={staggerItem}
        >
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Scroll-Triggered Animation

```tsx
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';

function Section() {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      Content appears when scrolled into view
    </motion.section>
  );
}
```

### Custom Transitions

```tsx
import { motion } from 'framer-motion';
import { fadeIn, cardTransitions } from '@/lib/animations';

function CustomCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={cardTransitions.hover}
    >
      Custom transition
    </motion.div>
  );
}
```

## Mobile Optimization

All animations automatically optimize for mobile devices:
- **Reduced duration**: Animations are 30% faster on mobile
- **Simplified effects**: 3D transforms are reduced or removed on mobile
- **Reduced motion support**: Animations are disabled for users who prefer reduced motion

## Performance

All animations use GPU-accelerated properties:
- `transform` (translateX, translateY, scale, rotate, etc.)
- `opacity`
- `filter`

Avoid animating properties like `width`, `height`, `top`, `left` as they trigger layout recalculation.

## Accessibility

The animation system respects the `prefers-reduced-motion` media query. When users have this preference enabled, animations are either disabled or significantly reduced.

## Requirements

This animation system implements:
- **Requirement 4.2**: Viewport entry animations (fadeIn, slideIn)
- **Requirement 4.3**: Hover feedback animations (cardHover, cardTap)
- **Requirement 4.6**: Mobile animation simplification (automatic optimization)

## Related Files

- `components/website/animations/` - React components that use these variants
- `styles/3d-effects.css` - CSS utilities for 3D effects
- `lib/utils/3d-transforms.ts` - 3D transform calculation utilities
