# Service List Filtering and Search Guide

## Overview
The ServiceList component provides comprehensive filtering, search, and sorting capabilities for browsing services.

## Features

### 1. Search
- **How it works**: Type in the search box to find services by name or description
- **Case-insensitive**: Search works regardless of letter case
- **Real-time**: Results update as you type
- **Searches**: Service name and description fields

### 2. Category Filtering
- **How it works**: Click category buttons to filter by service category
- **All Services**: Click to show all services regardless of category
- **Visual feedback**: Selected category is highlighted in blue
- **Responsive**: Buttons stack on mobile devices

### 3. Price Range Filtering
- **How it works**: Use the dual range sliders to set minimum and maximum price
- **Dynamic range**: Sliders automatically adjust to available service prices
- **Display**: Current price range is shown above the sliders
- **Real-time**: Services update as you adjust the sliders

### 4. Sorting
- **Popularity** (default): Sort by number of reviews
- **Price: Low to High**: Ascending price order
- **Price: High to Low**: Descending price order
- **Highest Rated**: Sort by customer rating
- **Newest**: Sort by creation date (most recent first)

### 5. Reset Filters
- **One-click reset**: Click "Reset Filters" to clear all filters
- **Resets**: Search query, category, price range, and sort order
- **Returns to default**: Shows all services sorted by popularity

## Usage Examples

### Example 1: Find affordable design services
1. Click "Design" category button
2. Adjust price range to $0 - $6000
3. Results show only design services under $6000

### Example 2: Search for specific service
1. Type "web" in search box
2. Results show services with "web" in name or description
3. Optionally apply category or price filters

### Example 3: Find highest-rated services
1. Click "Highest Rated" in sort dropdown
2. Services are sorted by rating (highest first)
3. Combine with category filter for specific type

### Example 4: Browse by price
1. Click "Price: Low to High" in sort dropdown
2. Services are sorted from cheapest to most expensive
3. Use price range slider to narrow down options

## Component Props

```typescript
interface ServiceListProps {
  services: Service[];           // Array of services to display
  categories?: ServiceCategory[]; // Optional category list
  onServiceClick?: (service: Service) => void; // Callback when service clicked
  className?: string;            // Optional CSS class
}
```

## Service Data Structure

```typescript
interface Service {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  icon: string;
  category: string;
  price: number;
  rating: number;
  reviewCount: number;
  link: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}
```

## Styling

### Brand Colors
- Primary: #1E3A5F (Deep Blue)
- Background: White/Gray
- Text: Dark Gray/Black

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys for range sliders

### Screen Reader Support
- Semantic HTML structure
- Descriptive labels
- ARIA attributes where needed

### Color Contrast
- All text meets WCAG AA standards
- Sufficient contrast for readability

## Performance

### Optimization Techniques
- useMemo for efficient filtering
- Minimal re-renders
- Optimized sorting algorithms

### Data Handling
- Handles large service lists efficiently
- Smooth filtering and sorting
- No layout shifts during updates

## Testing

### Test Coverage
- 40 unit tests covering all features
- Search functionality tests
- Category filtering tests
- Price range filtering tests
- Sorting functionality tests
- Combined filter tests
- Edge case handling

### Running Tests
```bash
npm test -- components/website/sections/ServiceList.test.tsx
```

## Common Issues and Solutions

### Issue: Filters not updating
**Solution**: Ensure services array is properly passed and contains required fields

### Issue: Price range not working
**Solution**: Verify services have valid price values (numbers, not strings)

### Issue: Sort not working
**Solution**: Check that services have required fields (rating, reviewCount, createdAt)

### Issue: Search not finding results
**Solution**: Ensure search query matches service name or description (case-insensitive)

## Future Enhancements

Potential improvements for future versions:
- Advanced filters (rating range, review count)
- Filter presets/saved searches
- Filter history
- Comparison view
- Wishlist functionality
- Filter analytics

## Support

For issues or questions about the ServiceList component:
1. Check the test file for usage examples
2. Review the component JSDoc comments
3. Check the requirements document for specifications
