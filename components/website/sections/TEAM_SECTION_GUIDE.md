# TeamSection Component Guide

## Overview

The `TeamSection` component displays a team of members with filtering capabilities by department. It provides a professional presentation of team members with their avatars, positions, departments, and optional social media links that appear on hover.

## Features

- **Team Member Display**: Shows member avatars, names, positions, departments, and bios
- **Department Filtering**: Filter team members by department with "All Departments" option
- **Social Media Links**: Display social media links on hover (LinkedIn, Twitter, Facebook, Instagram, WeChat)
- **Responsive Design**: Adapts to mobile (1 col), tablet (2 cols), and desktop (3 cols) layouts
- **Empty State Handling**: Shows friendly message when no members match the filter
- **Results Counter**: Displays count of filtered members
- **Accessibility**: WCAG AA compliant with proper ARIA labels and semantic HTML
- **Callback Support**: Optional callback when member cards are clicked

## Component Props

```typescript
interface TeamSectionProps {
  members: TeamMember[];           // Array of team members to display
  onMemberClick?: (memberId: string) => void;  // Callback when member is clicked
  className?: string;              // Additional CSS classes for the section
}
```

## TeamMember Type

```typescript
interface TeamMember {
  id: string;                      // Unique identifier
  name: string;                    // Member's full name
  position: string;                // Job title/position
  department: string;              // Department name
  avatar: string;                  // Avatar image URL
  bio: string;                     // Short biography
  socialLinks?: SocialLink[];       // Optional social media links
}

interface SocialLink {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'wechat';
  url: string;                     // Link URL
  icon: string;                    // Icon emoji or character
  label: string;                   // Accessible label
}
```

## Usage Examples

### Basic Usage

```tsx
import { TeamSection } from '@/components/website/sections/TeamSection';
import type { TeamMember } from '@/types/website';

const members: TeamMember[] = [
  {
    id: 'member-1',
    name: 'John Smith',
    position: 'Chief Executive Officer',
    department: 'Executive',
    avatar: 'https://example.com/john.jpg',
    bio: 'Visionary leader with 20+ years of experience.',
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com/in/johnsmith', icon: '🔗', label: 'LinkedIn' },
    ],
  },
  // ... more members
];

export default function HomePage() {
  return (
    <TeamSection 
      members={members}
      onMemberClick={(memberId) => console.log('Clicked:', memberId)}
    />
  );
}
```

### With Custom Styling

```tsx
<TeamSection 
  members={members}
  className="bg-gradient-to-b from-blue-50 to-white"
/>
```

## Styling

The component uses Tailwind CSS classes for styling:

- **Section**: `py-12 md:py-16 lg:py-20` (responsive vertical padding)
- **Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (responsive columns)
- **Cards**: `bg-white rounded-lg shadow-md hover:shadow-lg` (card styling with hover effect)
- **Filters**: `px-4 py-2 rounded-full` (pill-shaped filter buttons)
- **Badges**: `px-3 py-1 bg-gray-100 text-gray-700` (department badges)

## Filtering Behavior

### Department Filter

- **All Departments**: Shows all team members (default state)
- **Specific Department**: Shows only members from the selected department
- **Filter Buttons**: Highlight active filter with blue background
- **Results Count**: Updates dynamically based on filter selection

### Empty State

When no members match the selected filter:
- Displays: "No team members found for the selected department."
- Hides: Filter buttons, results count, and member grid

## Responsive Behavior

### Mobile (<768px)
- Single column layout
- Full-width cards
- Compact padding
- Touch-friendly filter buttons

### Tablet (768px-1024px)
- Two column layout
- Optimized spacing
- Medium padding

### Desktop (>1024px)
- Three column layout
- Maximum width container (max-w-7xl)
- Generous spacing

## Accessibility Features

- **Semantic HTML**: Uses `<section>` and `<h2>` tags
- **Alt Text**: All images have descriptive alt text
- **ARIA Labels**: Social links have aria-label attributes
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Color Contrast**: Meets WCAG AA standards (4.5:1 for text)
- **Focus Indicators**: Clear focus states on buttons and links

## Social Media Links

Social links appear in an overlay when hovering over member cards:

- **Supported Platforms**: LinkedIn, Twitter, Facebook, Instagram, WeChat
- **Hover Effect**: Semi-transparent dark overlay with centered icons
- **Link Behavior**: Opens in new tab with `target="_blank"`
- **Security**: Uses `rel="noopener noreferrer"` for security

## Testing

The component includes 50 comprehensive unit tests covering:

- **Rendering**: Component structure, headings, descriptions, cards
- **Filtering**: Department filter functionality, active states
- **Interactions**: Member click callbacks, hover effects
- **Empty States**: No members, no filter matches
- **Responsive Design**: Grid layout, padding
- **Accessibility**: Heading hierarchy, alt text, ARIA labels
- **Edge Cases**: Long names, special characters, many social links

Run tests with:
```bash
npm test -- components/website/sections/TeamSection.test.tsx --testTimeout=10000 --forceExit
```

## Performance Considerations

- **useMemo**: Departments and filtered members are memoized to prevent unnecessary recalculations
- **Lazy Rendering**: Only visible members are rendered
- **Image Optimization**: Use optimized image URLs for avatars
- **CSS Classes**: Tailwind CSS provides efficient styling

## Common Patterns

### Fetching Team Data

```tsx
async function getTeamMembers(): Promise<TeamMember[]> {
  const response = await fetch('/api/team-members');
  return response.json();
}

export default async function HomePage() {
  const members = await getTeamMembers();
  return <TeamSection members={members} />;
}
```

### Handling Member Click

```tsx
function handleMemberClick(memberId: string) {
  // Navigate to member detail page
  router.push(`/team/${memberId}`);
}

<TeamSection 
  members={members}
  onMemberClick={handleMemberClick}
/>
```

### Filtering by Department

```tsx
const [selectedDept, setSelectedDept] = useState<string | null>(null);

const filteredMembers = selectedDept 
  ? members.filter(m => m.department === selectedDept)
  : members;

<TeamSection members={filteredMembers} />
```

## Customization

### Custom Department Filter

To customize the department filter appearance, modify the button classes:

```tsx
// In TeamSection.tsx, update the filter button className
className={`px-4 py-2 rounded-lg font-medium transition-colors ${
  selectedDepartment === department
    ? 'bg-purple-600 text-white'  // Custom active color
    : 'bg-gray-100 text-gray-700'  // Custom inactive color
}`}
```

### Custom Card Layout

To customize the member card layout, modify the card component:

```tsx
// Add additional information to the card
<div className="p-6">
  <h3>{member.name}</h3>
  <p>{member.position}</p>
  <p>{member.department}</p>
  <p>{member.bio}</p>
  {/* Add custom fields */}
  <p>{member.email}</p>
  <p>{member.phone}</p>
</div>
```

## Troubleshooting

### Members Not Showing

- Verify `members` array is not empty
- Check that member objects have all required fields
- Ensure avatar URLs are valid and accessible

### Filter Not Working

- Verify department names match exactly (case-sensitive)
- Check that `selectedDepartment` state is updating
- Ensure filter buttons have correct `data-testid` attributes

### Social Links Not Appearing

- Verify `socialLinks` array is populated
- Check that platform names match supported platforms
- Ensure URLs are valid and properly formatted
- Verify hover state is working (check CSS)

### Styling Issues

- Verify Tailwind CSS is properly configured
- Check for CSS conflicts with other stylesheets
- Ensure responsive breakpoints are correct
- Verify custom className doesn't override important styles

## Related Components

- **CaseShowcase**: Similar filtering pattern for case studies
- **ServiceList**: Similar card-based layout for services
- **Navigation**: Uses similar responsive design patterns

## Requirements Mapping

This component implements the following requirements:

- **Requirement 4.1**: Display team member list on homepage
- **Requirement 4.2**: Show member avatar, name, position, and bio
- **Requirement 4.3**: Display social media links on hover
- **Requirement 4.4**: Support department/position filtering
- **Requirement 17.1-17.3**: Responsive design across breakpoints
- **Requirement 20.1-20.4**: Accessibility compliance

## Version History

- **v1.0.0** (2026-01-23): Initial release with department filtering and social links
