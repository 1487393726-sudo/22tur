# Card3D Component

A reusable 3D card component with mouse-based rotation effects, glass morphism styling, and depth shadows for the website redesign.

## Features

- ✨ **3D Transform Effects**: Mouse-based rotation with smooth spring animations
- 🎨 **Glass Morphism**: Integrated glass effect styling (light/medium/heavy)
- 🌊 **Depth Shadows**: Configurable shadow depth (shallow/medium/deep)
- 📱 **Mobile Optimized**: Simplified effects for touch devices
- ♿ **Accessible**: Full keyboard navigation and ARIA support
- 🌍 **RTL Support**: Automatic transform adjustment for right-to-left layouts
- ⚡ **Performance**: GPU-accelerated animations with reduced motion support

## Installation

The component is already integrated into the project. Import it from:

```tsx
import { Card3D } from '@/components/website/3d/Card3D';
```

## Basic Usage

```tsx
import { Card3D } from '@/components/website/3d/Card3D';

function MyComponent() {
  return (
    <Card3D>
      <div className="p-6">
        <h3 className="text-xl font-bold">Card Title</h3>
        <p>Card content goes here</p>
      </div>
    </Card3D>
  );
}
```

## Props

### Card3D Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Card content |
| `intensity` | `'light' \| 'medium' \| 'heavy'` | `'medium'` | Hover effect intensity |
| `enableHover` | `boolean` | `true` | Enable hover 3D effects |
| `className` | `string` | `''` | Additional CSS classes |
| `onClick` | `() => void` | `undefined` | Click handler |
| `depth` | `'shallow' \| 'medium' \| 'deep'` | `'medium'` | Shadow depth level |
| `glassEffect` | `'light' \| 'medium' \| 'heavy' \| 'none'` | `'medium'` | Glass effect variant |
| `disable3D` | `boolean` | `false` | Disable 3D effects (2D fallback) |
| `isRTL` | `boolean` | `false` | RTL layout mode |
| `ariaLabel` | `string` | `undefined` | ARIA label for accessibility |
| `role` | `string` | `undefined` | ARIA role |
| `tabIndex` | `number` | `0` | Tab index for keyboard navigation |

## Examples

### Light Intensity Card

```tsx
<Card3D intensity="light" depth="shallow" glassEffect="light">
  <div className="p-6">
    <h3>Subtle Effect</h3>
    <p>Light 3D effects with minimal shadows</p>
  </div>
</Card3D>
```

### Heavy Intensity Card

```tsx
<Card3D intensity="heavy" depth="deep" glassEffect="heavy">
  <div className="p-6">
    <h3>Strong Effect</h3>
    <p>Pronounced 3D effects with deep shadows</p>
  </div>
</Card3D>
```

### Interactive Card

```tsx
<Card3D
  onClick={() => console.log('Clicked!')}
  ariaLabel="Click to view details"
>
  <div className="p-6">
    <h3>Interactive Card</h3>
    <p>Click me or press Enter/Space</p>
  </div>
</Card3D>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card3D intensity="light">
    <div className="p-6">Feature 1</div>
  </Card3D>
  <Card3D intensity="medium">
    <div className="p-6">Feature 2</div>
  </Card3D>
  <Card3D intensity="heavy">
    <div className="p-6">Feature 3</div>
  </Card3D>
</div>
```

### Service Card with Image

```tsx
<Card3D intensity="medium" onClick={() => navigate('/service')}>
  <div className="overflow-hidden">
    <img src="/service.jpg" alt="Service" className="h-48 w-full object-cover" />
    <div className="p-6">
      <h3 className="text-xl font-bold mb-2">Web Development</h3>
      <p className="text-gray-600">Professional services</p>
    </div>
  </div>
</Card3D>
```

### RTL Layout Card

```tsx
<Card3D isRTL={true}>
  <div className="p-6" dir="rtl">
    <h3>بطاقة RTL</h3>
    <p>هذه البطاقة تدعم التخطيط من اليمين إلى اليسار</p>
  </div>
</Card3D>
```

### Card without Glass Effect

```tsx
<Card3D glassEffect="none" className="bg-white border border-gray-200">
  <div className="p-6">
    <h3>Solid Card</h3>
    <p>No glass effect, just solid background</p>
  </div>
</Card3D>
```

## Intensity Levels

### Light
- Max rotation: 5 degrees
- Translate Y: -5px
- Scale: 1.01
- Best for: Subtle effects, dense layouts

### Medium (Default)
- Max rotation: 10 degrees
- Translate Y: -10px
- Scale: 1.02
- Best for: General purpose cards

### Heavy
- Max rotation: 15 degrees
- Translate Y: -15px
- Scale: 1.03
- Best for: Feature highlights, hero cards

## Depth Levels

### Shallow
- 2 shadow layers
- Subtle depth effect
- Best for: Flat designs, minimal shadows

### Medium (Default)
- 3 shadow layers
- Balanced depth effect
- Best for: General purpose cards

### Deep
- 4 shadow layers
- Strong depth effect
- Best for: Elevated elements, modals

## Glass Effect Variants

### Light
- Minimal blur and transparency
- Best for: Subtle glass effects

### Medium (Default)
- Balanced blur and transparency
- Best for: General purpose glass effects

### Heavy
- Strong blur and transparency
- Best for: Prominent glass effects

### None
- No glass effect applied
- Best for: Solid backgrounds

## Mobile Optimization

The component automatically:
- Detects mobile devices (viewport < 640px)
- Simplifies 3D effects for better performance
- Reduces animation complexity
- Maintains visual quality

## Accessibility

The component includes:
- Keyboard navigation support (Tab, Enter, Space)
- ARIA labels and roles
- Focus management
- Screen reader compatibility
- Reduced motion support

### Keyboard Navigation

- **Tab**: Focus the card
- **Enter/Space**: Trigger onClick (if provided)
- **Escape**: Remove focus

## Performance

The component is optimized for performance:
- GPU-accelerated transforms (transform, opacity)
- Spring animations with Framer Motion
- Automatic device capability detection
- Reduced motion support
- Will-change optimization

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Simplified effects

## Advanced Usage

### Custom Transform (Card3DCustom)

For advanced use cases, use `Card3DCustom` with a custom transform:

```tsx
import { Card3DCustom } from '@/components/website/3d/Card3D';

<Card3DCustom
  transform={{
    perspective: 1500,
    rotateX: 10,
    rotateY: 15,
    rotateZ: 0,
    translateZ: 50,
    scale: 1.05,
  }}
  depth="deep"
>
  <div className="p-6">Custom Transform Card</div>
</Card3DCustom>
```

## Requirements Validation

This component validates the following requirements:

- **1.1**: 3D card effects with perspective and transforms
- **1.2**: Mouse-based 3D rotation on hover
- **1.3**: Depth shadows with multiple layers
- **2.2**: Glass effect integration
- **5.5**: Touch-optimized for mobile (minimum 44x44px targets)

## Testing

Run the unit tests:

```bash
npm test -- components/website/3d/__tests__/Card3D.test.tsx
```

## Related Components

- `CardGrid3D`: Grid layout for 3D cards with stagger animations
- `FlipCard3D`: 3D flip card for revealing content
- `HeroSection3D`: 3D hero section with parallax effects

## Troubleshooting

### 3D effects not working

1. Check browser support for 3D transforms
2. Verify `disable3D` prop is not set to `true`
3. Check if user has reduced motion preference enabled
4. Ensure device is not low-end (< 4 CPU cores)

### Glass effect not visible

1. Verify `glassEffect` prop is not set to `'none'`
2. Check if backdrop-filter is supported in browser
3. Ensure glass-effects.css is imported
4. Verify background has content to blur

### Performance issues

1. Reduce intensity level
2. Use `disable3D` on low-end devices
3. Limit number of cards on screen
4. Check for other heavy animations

## License

Part of the website 3D redesign project.


---

# CardGrid3D Component

A responsive grid layout component for 3D cards with stagger animations triggered by Intersection Observer.

## Features

- 📐 **Responsive Grid**: Configurable columns for mobile/tablet/desktop
- 🎬 **Stagger Animations**: Sequential item animations on scroll
- 👁️ **Intersection Observer**: Performance-optimized viewport detection
- 🎨 **Custom Patterns**: Wave, diagonal, spiral, and random stagger effects
- ♿ **Accessible**: List semantics with ARIA support
- 📱 **Mobile Optimized**: Faster animations on mobile devices
- ⚡ **Performance**: Lazy animation triggering

## Installation

Import from the 3D components directory:

```tsx
import { CardGrid3D } from '@/components/website/3d/CardGrid3D';
```

## Basic Usage

```tsx
import { CardGrid3D } from '@/components/website/3d/CardGrid3D';
import { Card3D } from '@/components/website/3d/Card3D';

function MyComponent() {
  const items = [
    { title: 'Item 1', description: 'Description 1' },
    { title: 'Item 2', description: 'Description 2' },
    { title: 'Item 3', description: 'Description 3' },
  ];

  return (
    <CardGrid3D>
      {items.map((item, index) => (
        <Card3D key={index}>
          <div className="p-6">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        </Card3D>
      ))}
    </CardGrid3D>
  );
}
```

## Props

### CardGrid3D Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Grid items (Card3D or other elements) |
| `columns` | `ResponsiveColumns` | `{mobile:1, tablet:2, desktop:3}` | Column configuration |
| `gap` | `string` | `'6'` | Gap between items (Tailwind spacing) |
| `staggerDelay` | `number` | `0.1` | Delay between item animations (seconds) |
| `className` | `string` | `''` | Additional CSS classes |
| `disableAnimation` | `boolean` | `false` | Disable all animations |
| `threshold` | `number` | `0.1` | Intersection Observer threshold (0-1) |
| `once` | `boolean` | `true` | Trigger animation only once |
| `animationDelay` | `number` | `0` | Delay before starting animations |
| `ariaLabel` | `string` | `undefined` | ARIA label for accessibility |
| `role` | `string` | `'list'` | ARIA role |

### ResponsiveColumns Interface

```tsx
interface ResponsiveColumns {
  mobile: number;   // Columns on mobile (<640px)
  tablet: number;   // Columns on tablet (640px-1024px)
  desktop: number;  // Columns on desktop (>1024px)
}
```

## Examples

### Default Grid (1-2-3 columns)

```tsx
<CardGrid3D>
  {items.map((item, index) => (
    <Card3D key={index}>
      <div className="p-6">{item.title}</div>
    </Card3D>
  ))}
</CardGrid3D>
```

### Custom Column Configuration

```tsx
<CardGrid3D
  columns={{
    mobile: 1,
    tablet: 3,
    desktop: 4,
  }}
  gap="8"
>
  {items.map((item, index) => (
    <Card3D key={index}>
      <div className="p-6">{item.title}</div>
    </Card3D>
  ))}
</CardGrid3D>
```

### Slower Stagger Animation

```tsx
<CardGrid3D staggerDelay={0.2}>
  {items.map((item, index) => (
    <Card3D key={index}>
      <div className="p-6">{item.title}</div>
    </Card3D>
  ))}
</CardGrid3D>
```

### Large Gap Grid

```tsx
<CardGrid3D gap="12">
  {items.map((item, index) => (
    <Card3D key={index}>
      <div className="p-12">{item.title}</div>
    </Card3D>
  ))}
</CardGrid3D>
```

### Static Grid (No Animation)

```tsx
<CardGrid3D disableAnimation={true}>
  {items.map((item, index) => (
    <Card3D key={index}>
      <div className="p-6">{item.title}</div>
    </Card3D>
  ))}
</CardGrid3D>
```

## Advanced Usage

### Custom Stagger Patterns

Use `CardGrid3DCustom` for advanced stagger patterns:

```tsx
import { CardGrid3DCustom, createWaveStagger } from '@/components/website/3d/CardGrid3D';

<CardGrid3DCustom
  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
  getItemDelay={createWaveStagger(3, 0.05)}
>
  {items.map((item, index) => (
    <Card3D key={index}>
      <div className="p-6">{item.title}</div>
    </Card3D>
  ))}
</CardGrid3DCustom>
```

### Wave Stagger Pattern

Items animate in a wave pattern:

```tsx
import { createWaveStagger } from '@/components/website/3d/CardGrid3D';

<CardGrid3DCustom
  getItemDelay={createWaveStagger(3, 0.05)}
>
  {/* items */}
</CardGrid3DCustom>
```

### Diagonal Stagger Pattern

Items animate diagonally:

```tsx
import { createDiagonalStagger } from '@/components/website/3d/CardGrid3D';

<CardGrid3DCustom
  getItemDelay={createDiagonalStagger(3, 0.08)}
>
  {/* items */}
</CardGrid3DCustom>
```

### Spiral Stagger Pattern

Items animate from center outward:

```tsx
import { createSpiralStagger } from '@/components/website/3d/CardGrid3D';

<CardGrid3DCustom
  getItemDelay={createSpiralStagger(3, 4, 0.05)}
>
  {/* items */}
</CardGrid3DCustom>
```

### Random Stagger Pattern

Items animate in random order:

```tsx
import { createRandomStagger } from '@/components/website/3d/CardGrid3D';

<CardGrid3DCustom
  getItemDelay={createRandomStagger(12, 0.05, 42)} // seed for reproducibility
>
  {/* items */}
</CardGrid3DCustom>
```

## Stagger Utilities

### createWaveStagger(columns, baseDelay)

Creates a wave pattern animation across rows and columns.

**Parameters:**
- `columns`: Number of columns in the grid
- `baseDelay`: Base delay multiplier (default: 0.05)

**Returns:** Function `(index: number) => delay`

### createDiagonalStagger(columns, baseDelay)

Creates a diagonal pattern animation.

**Parameters:**
- `columns`: Number of columns in the grid
- `baseDelay`: Base delay multiplier (default: 0.05)

**Returns:** Function `(index: number) => delay`

### createSpiralStagger(columns, rows, baseDelay)

Creates a spiral pattern from center outward.

**Parameters:**
- `columns`: Number of columns in the grid
- `rows`: Number of rows in the grid
- `baseDelay`: Base delay multiplier (default: 0.05)

**Returns:** Function `(index: number) => delay`

### createRandomStagger(totalItems, baseDelay, seed?)

Creates a random order animation.

**Parameters:**
- `totalItems`: Total number of items
- `baseDelay`: Base delay multiplier (default: 0.05)
- `seed`: Optional seed for reproducible randomness

**Returns:** Function `(index: number) => delay`

## Real-World Examples

### Blog Post Grid

```tsx
<CardGrid3D
  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap="8"
  staggerDelay={0.12}
  ariaLabel="Blog posts"
>
  {posts.map((post, index) => (
    <Card3D key={index} onClick={() => navigate(`/blog/${post.id}`)}>
      <div>
        <img src={post.image} alt={post.title} />
        <div className="p-6">
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
        </div>
      </div>
    </Card3D>
  ))}
</CardGrid3D>
```

### Service Cards

```tsx
<CardGrid3D
  columns={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap="6"
  threshold={0.2}
>
  {services.map((service, index) => (
    <Card3D key={index} depth="medium" glassEffect="medium">
      <div className="p-8">
        <div className="text-5xl mb-4">{service.icon}</div>
        <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
        <p className="text-gray-600">{service.description}</p>
      </div>
    </Card3D>
  ))}
</CardGrid3D>
```

### Team Member Grid

```tsx
<CardGrid3D
  columns={{ mobile: 1, tablet: 2, desktop: 4 }}
  gap="6"
>
  {team.map((member, index) => (
    <Card3D key={index} intensity="light">
      <div className="text-center p-6">
        <img src={member.avatar} alt={member.name} className="rounded-full" />
        <h3>{member.name}</h3>
        <p>{member.role}</p>
      </div>
    </Card3D>
  ))}
</CardGrid3D>
```

## Responsive Behavior

The grid automatically adjusts columns based on viewport:

- **Mobile (<640px)**: Uses `columns.mobile` value
- **Tablet (640px-1024px)**: Uses `columns.tablet` value
- **Desktop (>1024px)**: Uses `columns.desktop` value

## Animation Behavior

### Intersection Observer

The grid uses Intersection Observer to trigger animations when:
- The grid enters the viewport (based on `threshold`)
- Only triggers once by default (`once={true}`)
- Can be configured to trigger multiple times (`once={false}`)

### Stagger Effect

Items animate sequentially with a delay between each:
- Default delay: 0.1 seconds
- Mobile optimization: 30% faster animations
- Respects `prefers-reduced-motion` setting

### Mobile Optimization

On mobile devices:
- Stagger delay reduced by 30%
- Animation duration reduced by 30%
- Simplified animation variants

## Accessibility

The component includes:
- List semantics (`role="list"` and `role="listitem"`)
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Reduced motion support

## Performance

Optimizations include:
- Intersection Observer for lazy animation
- GPU-accelerated transforms
- Mobile-optimized animations
- Conditional animation rendering
- Will-change optimization

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Optimized animations

## Requirements Validation

This component validates the following requirements:

- **4.2**: Viewport entry animations with Intersection Observer
- **5.2**: Responsive mobile layout (1 column)
- **5.3**: Responsive tablet layout (2-3 columns)
- **5.4**: Responsive desktop layout (3+ columns)

## Testing

Run the unit tests:

```bash
npm test -- components/website/3d/__tests__/CardGrid3D.test.tsx
```

## Related Components

- `Card3D`: 3D card component for grid items
- `FlipCard3D`: 3D flip card for revealing content
- `HeroSection3D`: 3D hero section with parallax effects

---

# FlipCard3D Component

A 3D flip card component that rotates 180 degrees to reveal content on the back. Supports both hover and click triggers with glass morphism effects on both sides.

## Features

- 🔄 **180° Flip Animation**: Smooth rotateY animation
- 🖱️ **Dual Triggers**: Hover and click modes
- 🎨 **Glass Effects**: Glass morphism on both front and back
- ⌨️ **Keyboard Navigation**: Enter/Space key support
- ♿ **Accessible**: Full ARIA support and screen reader friendly
- 📱 **Mobile Optimized**: Click-only on mobile devices
- 🌍 **RTL Support**: Automatic rotation adjustment for RTL layouts
- 🎛️ **Controlled Mode**: External state control support

## Installation

Import from the 3D components directory:

```tsx
import { FlipCard3D } from '@/components/website/3d/FlipCard3D';
```

## Basic Usage

```tsx
import { FlipCard3D } from '@/components/website/3d/FlipCard3D';

function MyComponent() {
  return (
    <FlipCard3D
      frontContent={
        <div className="p-6 bg-blue-500 text-white">
          <h3>Front Side</h3>
          <p>Click to flip</p>
        </div>
      }
      backContent={
        <div className="p-6 bg-purple-500 text-white">
          <h3>Back Side</h3>
          <p>Click again to flip back</p>
        </div>
      }
      width={300}
      height={200}
    />
  );
}
```

## Props

### FlipCard3D Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `frontContent` | `ReactNode` | required | Content for the front side |
| `backContent` | `ReactNode` | required | Content for the back side |
| `flipTrigger` | `'hover' \| 'click'` | `'click'` | Trigger mode for flipping |
| `className` | `string` | `''` | Additional CSS classes |
| `glassEffect` | `'light' \| 'medium' \| 'heavy' \| 'none'` | `'medium'` | Glass effect variant |
| `depth` | `'shallow' \| 'medium' \| 'deep'` | `'medium'` | Shadow depth level |
| `initialFlipped` | `boolean` | `false` | Initial flip state |
| `isFlipped` | `boolean` | `undefined` | Controlled flip state |
| `onFlipChange` | `(isFlipped: boolean) => void` | `undefined` | Flip state change callback |
| `disabled` | `boolean` | `false` | Disable flip interaction |
| `isRTL` | `boolean` | `false` | RTL layout mode |
| `ariaLabel` | `string` | `undefined` | ARIA label for accessibility |
| `tabIndex` | `number` | `0` | Tab index for keyboard navigation |
| `width` | `string \| number` | `'100%'` | Card width |
| `height` | `string \| number` | `'auto'` | Card height |

## Examples

### Click-to-Flip Card (Default)

```tsx
<FlipCard3D
  frontContent={
    <div className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center text-white">
        <h3 className="text-xl font-bold mb-2">Front Side</h3>
        <p>Click to flip</p>
      </div>
    </div>
  }
  backContent={
    <div className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-purple-600 to-pink-500">
      <div className="text-center text-white">
        <h3 className="text-xl font-bold mb-2">Back Side</h3>
        <p>Click again to flip back</p>
      </div>
    </div>
  }
  width={300}
  height={200}
/>
```

### Hover-to-Flip Card

```tsx
<FlipCard3D
  flipTrigger="hover"
  frontContent={
    <div className="p-6 bg-white">
      <h3 className="text-xl font-bold">Service Title</h3>
      <p className="text-gray-600">Hover to see details</p>
    </div>
  }
  backContent={
    <div className="p-6 bg-white">
      <h3 className="text-lg font-bold mb-3">Service Details</h3>
      <ul className="space-y-2 text-sm">
        <li>✓ Feature 1</li>
        <li>✓ Feature 2</li>
        <li>✓ Feature 3</li>
      </ul>
    </div>
  }
  width={300}
  height={250}
/>
```

### Team Member Card

```tsx
<FlipCard3D
  flipTrigger="hover"
  frontContent={
    <div className="flex flex-col items-center justify-center h-full p-6 bg-white">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mb-4" />
      <h3 className="text-xl font-bold text-gray-800">John Doe</h3>
      <p className="text-gray-600">CEO & Founder</p>
    </div>
  }
  backContent={
    <div className="flex flex-col justify-center h-full p-6 bg-white">
      <h3 className="text-lg font-bold text-gray-800 mb-3">About John</h3>
      <p className="text-sm text-gray-600 mb-4">
        10+ years of experience in tech industry.
      </p>
      <div className="flex gap-3">
        <a href="#" className="text-blue-600">LinkedIn</a>
        <a href="#" className="text-blue-600">Twitter</a>
      </div>
    </div>
  }
  width={280}
  height={320}
  glassEffect="medium"
/>
```

### Controlled Flip Card

```tsx
function ControlledExample() {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsFlipped(!isFlipped)}>
        Toggle Flip
      </button>
      <FlipCard3D
        isFlipped={isFlipped}
        onFlipChange={setIsFlipped}
        frontContent={<div className="p-6">Front</div>}
        backContent={<div className="p-6">Back</div>}
      />
    </>
  );
}
```

### Service Cards Grid

```tsx
const services = [
  { title: 'Web Dev', icon: '🌐', features: ['React', 'Next.js'] },
  { title: 'Mobile', icon: '📱', features: ['iOS', 'Android'] },
  { title: 'Design', icon: '🎨', features: ['Figma', 'Adobe XD'] },
];

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {services.map((service, index) => (
    <FlipCard3D
      key={index}
      flipTrigger="hover"
      frontContent={
        <div className="flex flex-col items-center justify-center h-full p-6 bg-white">
          <div className="text-6xl mb-4">{service.icon}</div>
          <h3 className="text-lg font-bold">{service.title}</h3>
        </div>
      }
      backContent={
        <div className="flex flex-col justify-center h-full p-6 bg-white">
          <h3 className="text-lg font-bold mb-3">{service.title}</h3>
          <ul className="space-y-2">
            {service.features.map((feature, i) => (
              <li key={i} className="text-sm">✓ {feature}</li>
            ))}
          </ul>
        </div>
      }
      height={220}
    />
  ))}
</div>
```

### RTL Support

```tsx
<FlipCard3D
  isRTL={true}
  frontContent={
    <div className="p-6 text-right" dir="rtl">
      <h3>الجانب الأمامي</h3>
      <p>انقر للقلب</p>
    </div>
  }
  backContent={
    <div className="p-6 text-right" dir="rtl">
      <h3>الجانب الخلفي</h3>
      <p>معلومات إضافية</p>
    </div>
  }
/>
```

## Advanced Usage

### Custom Animation (FlipCard3DCustom)

For custom flip animation timing:

```tsx
import { FlipCard3DCustom } from '@/components/website/3d/FlipCard3D';

<FlipCard3DCustom
  flipDuration={1.2}
  flipEasing={[0.68, -0.55, 0.265, 1.55]} // Bounce easing
  frontContent={<div>Front</div>}
  backContent={<div>Back</div>}
/>
```

### Manual Control Only

Disable automatic flip, only allow external control:

```tsx
<FlipCard3DCustom
  manualOnly={true}
  isFlipped={externalState}
  onFlipChange={setExternalState}
  frontContent={<div>Front</div>}
  backContent={<div>Back</div>}
/>
```

## Trigger Modes

### Click Mode (Default)
- Flips on click/tap
- Keyboard accessible (Enter/Space)
- Has button role
- Shows aria-pressed state
- Best for: Mobile-friendly interactions

### Hover Mode
- Flips on mouse enter
- Flips back on mouse leave
- Disabled on mobile (uses click instead)
- No button role
- Best for: Desktop-only experiences

## Mobile Behavior

On mobile devices (viewport < 640px):
- Hover trigger automatically switches to click
- Simplified animations for better performance
- Touch-optimized interaction
- Maintains full functionality

## Keyboard Navigation

The component supports full keyboard navigation:

- **Tab**: Focus the card
- **Enter**: Toggle flip state
- **Space**: Toggle flip state
- **Escape**: Remove focus (browser default)

## Accessibility

The component includes comprehensive accessibility features:

### ARIA Attributes
- `aria-label`: Describes the card and current state
- `aria-pressed`: Indicates flip state (click mode only)
- `aria-hidden`: Hides non-visible face from screen readers
- `role="button"`: Applied in click mode

### Screen Reader Support
- Announces current side (front/back)
- Announces flip action availability
- Proper focus management
- Semantic HTML structure

### Keyboard Support
- Full keyboard navigation
- Focus indicators
- Logical tab order
- Escape key support

## Performance

Optimizations include:
- GPU-accelerated transforms (rotateY)
- Will-change optimization
- Backface-visibility: hidden
- Perspective optimization
- Mobile-specific optimizations

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support with optimizations

## Requirements Validation

This component validates the following requirements:

- **9.2**: 180-degree flip animation for service details
- **11.3**: Hover flip effect for team member cards

## Testing

Run the unit tests:

```bash
npm test -- components/website/3d/__tests__/FlipCard3D.test.tsx
```

All 31 tests pass, covering:
- Basic rendering
- Click and hover triggers
- Keyboard navigation
- Controlled mode
- Disabled state
- Accessibility
- RTL support
- Edge cases

## Related Components

- `Card3D`: 3D card with mouse-based rotation
- `CardGrid3D`: Grid layout for 3D cards
- `HeroSection3D`: 3D hero section

## Troubleshooting

### Animations not triggering

1. Check if grid is in viewport
2. Verify `disableAnimation` is not set to `true`
3. Check `threshold` value (try increasing it)
4. Ensure `once={false}` if you want repeated animations

### Grid columns not responsive

1. Verify Tailwind CSS is configured correctly
2. Check if custom `className` overrides grid classes
3. Ensure viewport meta tag is present in HTML

### Performance issues

1. Reduce `staggerDelay` for faster animations
2. Use `disableAnimation` on low-end devices
3. Increase `threshold` to trigger later
4. Limit number of items in grid

## Examples File

See `CardGrid3D.example.tsx` for comprehensive usage examples including:
- Basic grid with default configuration
- Custom column configurations
- Wave stagger animation
- Diagonal stagger animation
- Blog post grid
- Service cards with icons
- Team member grid
- Static grid (no animation)
- Large gap grid

---

# HeroSection3D Component

An eye-catching hero section component with 3D elements, parallax scrolling, floating animations, gradient backgrounds, and glass morphism CTA button.

## Features

- 🌊 **Parallax Scrolling**: Multi-layer parallax effect on scroll
- ✨ **3D Floating Elements**: Animated floating shapes in background
- 🎨 **Gradient Backgrounds**: Multiple color schemes with depth
- 🎬 **Animated Text Entrance**: Smooth fade-in animations for title and subtitle
- 🔘 **Glass CTA Button**: 3D hover effect with glass morphism
- 📱 **Mobile Optimized**: Simplified effects for better performance
- 🌍 **RTL Support**: Automatic layout adjustment for right-to-left languages
- ♿ **Accessible**: Full ARIA support and keyboard navigation

## Installation

Import from the 3D components directory:

```tsx
import { HeroSection3D } from '@/components/website/3d/HeroSection3D';
```

## Basic Usage

```tsx
import { HeroSection3D } from '@/components/website/3d/HeroSection3D';

function HomePage() {
  return (
    <HeroSection3D
      title="Welcome to Our Platform"
      subtitle="Build amazing products with our cutting-edge technology"
      ctaText="Get Started"
      ctaLink="/signup"
      locale="en"
    />
  );
}
```

## Props

### HeroSection3D Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Main title text |
| `subtitle` | `string` | required | Subtitle or description text |
| `ctaText` | `string` | required | Call-to-action button text |
| `ctaLink` | `string` | required | CTA button link/href |
| `locale` | `string` | required | Current locale for text direction |
| `backgroundImage` | `string` | `undefined` | Optional background image URL |
| `className` | `string` | `''` | Additional CSS classes |
| `onCtaClick` | `() => void` | `undefined` | CTA button click handler |
| `enableParallax` | `boolean` | `true` | Enable parallax scrolling effect |
| `enableFloatingElements` | `boolean` | `true` | Enable floating elements animation |
| `gradientScheme` | `'blue' \| 'purple' \| 'green' \| 'orange'` | `'blue'` | Gradient color scheme |

## Examples

### Basic Hero Section (Blue Gradient)

```tsx
<HeroSection3D
  title="Welcome to Our Platform"
  subtitle="Build amazing products with our cutting-edge technology and innovative solutions"
  ctaText="Get Started"
  ctaLink="/signup"
  locale="en"
  gradientScheme="blue"
/>
```

### Purple Gradient with Background Image

```tsx
<HeroSection3D
  title="Transform Your Business"
  subtitle="Leverage the power of AI and automation to scale your operations"
  ctaText="Learn More"
  ctaLink="/about"
  locale="en"
  gradientScheme="purple"
  backgroundImage="/images/hero-bg.jpg"
/>
```

### Green Gradient without Floating Elements

```tsx
<HeroSection3D
  title="Sustainable Solutions"
  subtitle="Join us in building a greener future with eco-friendly technology"
  ctaText="Explore"
  ctaLink="/solutions"
  locale="en"
  gradientScheme="green"
  enableFloatingElements={false}
/>
```

### Orange Gradient without Parallax

```tsx
<HeroSection3D
  title="Ignite Your Creativity"
  subtitle="Unleash your potential with our powerful creative tools and resources"
  ctaText="Start Creating"
  ctaLink="/create"
  locale="en"
  gradientScheme="orange"
  enableParallax={false}
/>
```

### Chinese Language (中文)

```tsx
<HeroSection3D
  title="欢迎来到我们的平台"
  subtitle="使用我们的尖端技术和创新解决方案构建令人惊叹的产品"
  ctaText="开始使用"
  ctaLink="/signup"
  locale="zh"
  gradientScheme="blue"
/>
```

### RTL Layout (Uyghur - ئۇيغۇرچە)

```tsx
<HeroSection3D
  title="پلاتفورمىمىزغا خۇش كەپسىز"
  subtitle="ئىلغار تېخنىكا ۋە يېڭىلىق ھەل قىلىش چارىلىرى بىلەن ئاجايىپ مەھسۇلاتلار ياساڭ"
  ctaText="باشلاش"
  ctaLink="/signup"
  locale="ug"
  gradientScheme="purple"
/>
```

### With Custom CTA Handler

```tsx
const handleCTAClick = () => {
  console.log('CTA clicked!');
  // Custom logic here (e.g., open modal, track analytics)
};

<HeroSection3D
  title="Ready to Get Started?"
  subtitle="Join thousands of satisfied customers who trust our platform"
  ctaText="Sign Up Now"
  ctaLink="/signup"
  locale="en"
  gradientScheme="blue"
  onCtaClick={handleCTAClick}
/>
```

## Gradient Schemes

The component supports four gradient color schemes:

### Blue (Default)
- From: Blue 600
- Via: Cyan 500
- To: Purple 600
- Best for: Technology, professional services

### Purple
- From: Purple 600
- Via: Pink 500
- To: Indigo 600
- Best for: Creative, design, luxury

### Green
- From: Green 600
- Via: Emerald 500
- To: Teal 600
- Best for: Sustainability, health, nature

### Orange
- From: Orange 600
- Via: Amber 500
- To: Red 600
- Best for: Energy, creativity, excitement

## Parallax Effect

The parallax effect creates depth by moving different layers at different speeds:

- **Layer 1 (Content)**: Moves slowest (100px)
- **Layer 2 (Background Image)**: Moves medium (200px)
- **Layer 3 (Gradient)**: Moves fastest (300px)

Enable/disable with `enableParallax` prop:

```tsx
<HeroSection3D
  enableParallax={true} // Enable parallax
  // ... other props
/>
```

## Floating Elements

Floating elements are animated shapes that create visual interest:

- 6 elements by default
- Random sizes (50-150px)
- Random positions
- Smooth floating animation (15-25s duration)
- Automatically disabled on mobile

Enable/disable with `enableFloatingElements` prop:

```tsx
<HeroSection3D
  enableFloatingElements={true} // Enable floating elements
  // ... other props
/>
```

## CTA Button

The CTA button features:

- Glass morphism effect
- 3D hover animation (lift and tilt)
- Gradient background
- Arrow icon (auto-flips for RTL)
- Focus ring for accessibility
- Tap animation

### CTA Button Behavior

**On Hover:**
- Scales up to 1.05
- Lifts up 5px
- Tilts forward 5 degrees

**On Click:**
- Scales down to 0.98
- Triggers `onCtaClick` if provided
- Navigates to `ctaLink`

## Mobile Optimization

On mobile devices (viewport < 768px):

- Floating elements are disabled
- Parallax effect is simplified
- Animations are faster (30% reduction)
- Text sizes are responsive
- CTA button is touch-optimized

## RTL Support

For right-to-left languages (e.g., Arabic, Uyghur):

- Set `locale="ug"` or other RTL locale
- Layout automatically mirrors
- CTA arrow icon flips direction
- Text alignment adjusts
- Parallax effects maintain visual consistency

## Accessibility

The component includes comprehensive accessibility features:

### ARIA Attributes
- `aria-label` on CTA button
- `aria-hidden` on decorative elements
- `role="button"` on CTA

### Keyboard Support
- Tab to focus CTA button
- Enter/Space to activate CTA
- Focus ring visible

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy
- Descriptive button text

### Motion Preferences
- Respects `prefers-reduced-motion`
- Disables animations if user prefers

## Performance

Optimizations include:

- GPU-accelerated transforms
- Framer Motion spring animations
- Conditional rendering (mobile detection)
- Lazy animation triggering
- Will-change optimization
- Backface-visibility: hidden

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Optimized animations

## Requirements Validation

This component validates the following requirements:

- **1.4**: Gradient background with depth effect
- **7.1**: 3D hero section display
- **7.5**: Clear CTA button with 3D hover effect

## Real-World Examples

### Homepage Hero

```tsx
<HeroSection3D
  title="Build the Future with AI"
  subtitle="Transform your business with cutting-edge artificial intelligence and machine learning solutions"
  ctaText="Start Free Trial"
  ctaLink="/trial"
  locale="en"
  gradientScheme="blue"
  backgroundImage="/images/ai-pattern.svg"
/>
```

### Product Launch

```tsx
<HeroSection3D
  title="Introducing Product X"
  subtitle="The revolutionary new way to manage your workflow and boost productivity"
  ctaText="Pre-Order Now"
  ctaLink="/preorder"
  locale="en"
  gradientScheme="purple"
  onCtaClick={() => trackEvent('preorder_clicked')}
/>
```

### Service Landing Page

```tsx
<HeroSection3D
  title="Professional Web Development"
  subtitle="We create stunning, high-performance websites that drive results"
  ctaText="Get a Quote"
  ctaLink="/contact"
  locale="en"
  gradientScheme="green"
  enableFloatingElements={true}
/>
```

### Multi-Language Site

```tsx
function Hero({ locale }: { locale: string }) {
  const content = {
    en: {
      title: "Welcome",
      subtitle: "Build amazing products",
      cta: "Get Started"
    },
    zh: {
      title: "欢迎",
      subtitle: "构建令人惊叹的产品",
      cta: "开始使用"
    },
    ug: {
      title: "خۇش كەپسىز",
      subtitle: "ئاجايىپ مەھسۇلاتلار ياساڭ",
      cta: "باشلاش"
    }
  };

  return (
    <HeroSection3D
      title={content[locale].title}
      subtitle={content[locale].subtitle}
      ctaText={content[locale].cta}
      ctaLink="/signup"
      locale={locale}
    />
  );
}
```

## Customization

### Custom Gradient Colors

While the component provides 4 preset gradients, you can customize with `className`:

```tsx
<HeroSection3D
  title="Custom Colors"
  subtitle="With custom gradient"
  ctaText="Explore"
  ctaLink="/explore"
  locale="en"
  className="bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500"
/>
```

### Custom CTA Styling

The CTA button can be styled with Tailwind classes via the component's internal structure, or you can create a custom hero section based on this component.

## Testing

Run the unit tests:

```bash
npm test -- components/website/3d/__tests__/HeroSection3D.test.tsx
```

## Related Components

- `Card3D`: 3D card with mouse-based rotation
- `CardGrid3D`: Grid layout for 3D cards
- `FlipCard3D`: 3D flip card for revealing content

## Examples File

See `HeroSection3D.example.tsx` for comprehensive usage examples including:
- Basic hero section (blue gradient)
- Purple gradient with background image
- Green gradient without floating elements
- Orange gradient without parallax
- Chinese language example
- RTL layout example (Uyghur)
- Custom CTA handler
- Minimal configuration
- Full featured with all options
- Mobile optimized

## Troubleshooting

### Parallax not working

1. Ensure `enableParallax={true}` is set
2. Check if page has enough scroll height
3. Verify Framer Motion is installed
4. Check browser console for errors

### Floating elements not visible

1. Ensure `enableFloatingElements={true}` is set
2. Check if on mobile (automatically disabled)
3. Verify gradient scheme is set correctly
4. Check z-index conflicts

### CTA button not clickable

1. Verify `ctaLink` is set correctly
2. Check if `onCtaClick` is interfering
3. Ensure no overlapping elements
4. Check z-index of hero section

### Performance issues

1. Disable parallax with `enableParallax={false}`
2. Disable floating elements with `enableFloatingElements={false}`
3. Remove background image
4. Check for other heavy animations on page

## License

Part of the website 3D redesign project.
