# Animation Components

This directory contains reusable animation wrapper components for the website 3D redesign project. These components use Framer Motion to provide smooth, performant animations that enhance the user experience.

## Components

### FadeInView

A wrapper component that fades in children when they enter the viewport.

**Features:**
- ✅ Viewport-based animation triggering using Intersection Observer
- ✅ Customizable delay, duration, and threshold
- ✅ Automatic support for `prefers-reduced-motion`
- ✅ Mobile-optimized animations (30% faster)
- ✅ GPU-accelerated for smooth performance
- ✅ Fully accessible and screen reader friendly

**Basic Usage:**

```tsx
import { FadeInView } from '@/components/website/animations';

export default function MyComponent() {
  return (
    <FadeInView>
      <h1>This will fade in when scrolled into view</h1>
    </FadeInView>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | required | Content to animate |
| `delay` | `number` | `0` | Delay before animation starts (seconds) |
| `duration` | `number` | `0.5` | Duration of the animation (seconds) |
| `threshold` | `number` | `0.1` | Viewport intersection threshold (0-1) |
| `className` | `string` | `undefined` | Additional CSS classes |
| `once` | `boolean` | `true` | Animate only once or every time it enters viewport |

**Advanced Examples:**

```tsx
// Custom delay and duration
<FadeInView delay={0.3} duration={0.8}>
  <div>Delayed fade in</div>
</FadeInView>

// Trigger when 50% visible
<FadeInView threshold={0.5}>
  <div>Fades in at 50% visibility</div>
</FadeInView>

// Repeat animation on every scroll
<FadeInView once={false}>
  <div>Animates every time</div>
</FadeInView>

// Staggered animations
{items.map((item, index) => (
  <FadeInView key={item.id} delay={index * 0.1}>
    <Card {...item} />
  </FadeInView>
))}
```

**Accessibility:**

The component automatically respects the user's `prefers-reduced-motion` setting:
- When enabled: Animations are disabled, content appears immediately
- When disabled: Full animations are applied

This ensures the component is accessible to users with motion sensitivity.

**Performance:**

- Uses GPU-accelerated properties (`opacity`, `transform`)
- Automatically optimized for mobile devices (30% faster animations)
- Leverages Intersection Observer for efficient viewport detection
- No layout thrashing or reflows

## Requirements

This component implements:
- **Requirement 4.2**: Viewport entry animations using Framer Motion
- **Accessibility**: `prefers-reduced-motion` support
- **Performance**: GPU acceleration and mobile optimization

## Testing

Run tests with:

```bash
# Test FadeInView
npm test -- components/website/animations/__tests__/FadeInView.test.tsx

# Test SlideInView
npm test -- components/website/animations/__tests__/SlideInView.test.tsx

# Test all animation components
npm test -- components/website/animations/__tests__/
```

## Examples

### FadeInView Examples

See `FadeInView.example.tsx` for comprehensive usage examples including:
- Basic fade in
- Custom delays and durations
- Threshold configurations
- Repeating animations
- Staggered content
- Card grids
- Hero sections

### SlideInView Examples

See `SlideInView.example.tsx` for comprehensive usage examples including:
- All four slide directions (left, right, up, down)
- Custom delays and durations
- Threshold configurations
- Repeating animations
- Alternating directions
- Complex content with icons and buttons

### CountUpAnimation Examples

See `CountUpAnimation.example.tsx` for comprehensive usage examples including:
- Basic count up animations
- Prefixes and suffixes (%, $, +)
- Decimal places
- Different easing functions
- Statistics dashboard
- Custom separators
- Custom start values
- Real-world use cases

### SlideInView

A wrapper component that slides in children from a specified direction when they enter the viewport.

**Features:**
- ✅ Four slide directions: left, right, up, down
- ✅ Viewport-based animation triggering using Intersection Observer
- ✅ Customizable delay, duration, and threshold
- ✅ Automatic support for `prefers-reduced-motion`
- ✅ Mobile-optimized animations (30% faster)
- ✅ GPU-accelerated for smooth performance
- ✅ Fully accessible and screen reader friendly

**Basic Usage:**

```tsx
import { SlideInView } from '@/components/website/animations';

export default function MyComponent() {
  return (
    <SlideInView direction="left">
      <h1>This will slide in from the left</h1>
    </SlideInView>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | required | Content to animate |
| `direction` | `'left' \| 'right' \| 'up' \| 'down'` | `'up'` | Direction from which element slides in |
| `delay` | `number` | `0` | Delay before animation starts (seconds) |
| `duration` | `number` | `0.5` | Duration of the animation (seconds) |
| `threshold` | `number` | `0.1` | Viewport intersection threshold (0-1) |
| `className` | `string` | `undefined` | Additional CSS classes |
| `once` | `boolean` | `true` | Animate only once or every time it enters viewport |

**Advanced Examples:**

```tsx
// Slide from different directions
<SlideInView direction="left">
  <div>Slides from left</div>
</SlideInView>

<SlideInView direction="right">
  <div>Slides from right</div>
</SlideInView>

<SlideInView direction="up">
  <div>Slides up from bottom</div>
</SlideInView>

<SlideInView direction="down">
  <div>Slides down from top</div>
</SlideInView>

// Custom delay and duration
<SlideInView direction="left" delay={0.3} duration={0.8}>
  <div>Delayed slide in</div>
</SlideInView>

// Alternating directions for visual interest
{items.map((item, index) => (
  <SlideInView 
    key={item.id} 
    direction={index % 2 === 0 ? 'left' : 'right'}
    delay={index * 0.1}
  >
    <Card {...item} />
  </SlideInView>
))}

// Repeat animation on every scroll
<SlideInView direction="up" once={false}>
  <div>Animates every time</div>
</SlideInView>
```

**Accessibility:**

The component automatically respects the user's `prefers-reduced-motion` setting:
- When enabled: Animations are disabled, content appears immediately
- When disabled: Full slide animations are applied

This ensures the component is accessible to users with motion sensitivity.

**Performance:**

- Uses GPU-accelerated properties (`opacity`, `transform`)
- Automatically optimized for mobile devices (30% faster animations)
- Leverages Intersection Observer for efficient viewport detection
- No layout thrashing or reflows

### CountUpAnimation

A component that animates numbers counting up from a start value to an end value when entering the viewport.

**Features:**
- ✅ Smooth counting animation with customizable duration
- ✅ Viewport-based triggering using Intersection Observer
- ✅ Support for prefixes and suffixes (e.g., $, %, +)
- ✅ Configurable decimal places
- ✅ Thousand separators with custom characters
- ✅ Multiple easing functions (linear, easeIn, easeOut, easeInOut)
- ✅ Custom start values
- ✅ Automatic support for `prefers-reduced-motion`
- ✅ Fully accessible and screen reader friendly

**Basic Usage:**

```tsx
import { CountUpAnimation } from '@/components/website/animations';

export default function StatsSection() {
  return (
    <div>
      <CountUpAnimation end={1000} />
    </div>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `end` | `number` | required | Target number to count up to |
| `start` | `number` | `0` | Starting number |
| `duration` | `number` | `2` | Duration of the counting animation (seconds) |
| `prefix` | `string` | `''` | Text to display before the number |
| `suffix` | `string` | `''` | Text to display after the number |
| `decimals` | `number` | `0` | Number of decimal places to display |
| `separator` | `boolean` | `true` | Whether to use thousand separators |
| `separatorChar` | `string` | `','` | Custom separator character |
| `decimalChar` | `string` | `'.'` | Custom decimal character |
| `className` | `string` | `undefined` | Additional CSS classes |
| `once` | `boolean` | `true` | Animate only once or every time it enters viewport |
| `threshold` | `number` | `0.3` | Viewport intersection threshold (0-1) |
| `easing` | `'linear' \| 'easeIn' \| 'easeOut' \| 'easeInOut'` | `'easeOut'` | Easing function for the animation |

**Advanced Examples:**

```tsx
// Percentage with decimal
<CountUpAnimation 
  end={99.9} 
  decimals={1} 
  suffix="%" 
/>

// Currency with thousand separator
<CountUpAnimation 
  end={5000} 
  prefix="$" 
  separator={true}
/>

// Count with plus suffix
<CountUpAnimation 
  end={1000} 
  suffix="+" 
  separator={true}
/>

// Custom start value
<CountUpAnimation 
  start={50} 
  end={100} 
  suffix="%" 
/>

// European number format
<CountUpAnimation 
  end={1234.56} 
  decimals={2}
  separatorChar="."
  decimalChar=","
  separator={true}
/>

// Different easing functions
<CountUpAnimation 
  end={1000} 
  easing="easeInOut"
  duration={3}
/>

// Statistics dashboard example
<div className="stats-grid">
  <div>
    <h3>Total Users</h3>
    <CountUpAnimation 
      end={15420} 
      separator={true}
      className="text-4xl font-bold"
    />
  </div>
  <div>
    <h3>Revenue</h3>
    <CountUpAnimation 
      end={98500} 
      prefix="$" 
      separator={true}
      className="text-4xl font-bold"
    />
  </div>
  <div>
    <h3>Success Rate</h3>
    <CountUpAnimation 
      end={99.7} 
      decimals={1} 
      suffix="%"
      className="text-4xl font-bold"
    />
  </div>
</div>
```

**Accessibility:**

The component automatically respects the user's `prefers-reduced-motion` setting:
- When enabled: Animations are disabled, final value appears immediately
- When disabled: Full counting animation is applied

This ensures the component is accessible to users with motion sensitivity.

**Performance:**

- Uses `requestAnimationFrame` for smooth 60fps animation
- Efficient cleanup on unmount
- No unnecessary re-renders
- Optimized number formatting

## Future Components

Additional animation wrappers as needed

## Related Files

- `lib/animations/variants.ts` - Framer Motion animation variants
- `lib/animations/transitions.ts` - Transition configurations
- `styles/3d-effects.css` - 3D effect utilities
