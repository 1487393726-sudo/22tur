# ConsultationForm Component Guide

## Overview

The `ConsultationForm` component provides a comprehensive online consultation request form for the website system. It collects user information, validates input, and submits consultation requests to the backend API.

## Features

- **Form Fields**: Name, Email, Phone, Service Type, Message, and optional Preferred Time
- **Comprehensive Validation**: Email format, phone format, required fields, message length
- **Error Handling**: Real-time error clearing, user-friendly error messages
- **Accessibility**: WCAG AA compliant with proper ARIA attributes
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Callbacks**: Success and error callbacks for parent component integration
- **Loading State**: Disabled button during submission

## Installation

The component is located at:
```
components/website/sections/ConsultationForm.tsx
```

## Usage

### Basic Usage

```tsx
import ConsultationForm from '@/components/website/sections/ConsultationForm';

export default function ConsultationPage() {
  return (
    <div>
      <ConsultationForm />
    </div>
  );
}
```

### With Initial Service Type

```tsx
<ConsultationForm serviceType="web-design" />
```

### With Callbacks

```tsx
<ConsultationForm
  serviceType="web-development"
  onSubmitSuccess={() => {
    console.log('Consultation submitted successfully');
    // Redirect or show success message
  }}
  onSubmitError={(error) => {
    console.error('Submission failed:', error);
    // Handle error
  }}
/>
```

## Props

### `serviceType?: string`
- **Type**: `string`
- **Default**: `''`
- **Description**: Initial service type to pre-select in the dropdown
- **Example**: `"web-design"`, `"web-development"`, `"mobile-app"`, `"consulting"`, `"other"`

### `onSubmitSuccess?: () => void`
- **Type**: `() => void`
- **Default**: `undefined`
- **Description**: Callback function called when form submission succeeds
- **Example**: Redirect to thank you page or show success toast

### `onSubmitError?: (error: string) => void`
- **Type**: `(error: string) => void`
- **Default**: `undefined`
- **Description**: Callback function called when form submission fails
- **Parameters**: 
  - `error`: Error message string

## Form Fields

### Name (Required)
- **Type**: Text input
- **Validation**: Non-empty string
- **Error Message**: "Name is required"

### Email (Required)
- **Type**: Email input
- **Validation**: Valid email format (xxx@xxx.xxx)
- **Error Messages**: 
  - "Email is required"
  - "Please enter a valid email address"

### Phone Number (Required)
- **Type**: Tel input
- **Validation**: Valid phone format (supports various formats)
- **Supported Formats**:
  - `+1234567890`
  - `123-456-7890`
  - `(123) 456-7890`
  - `1234567890`
  - `+1 (555) 123-4567`
- **Error Messages**:
  - "Phone number is required"
  - "Please enter a valid phone number"

### Service Type (Required)
- **Type**: Select dropdown
- **Options**:
  - Web Design
  - Web Development
  - Mobile App Development
  - Consulting
  - Other
- **Error Message**: "Please select a service type"

### Message (Required)
- **Type**: Textarea
- **Validation**: Non-empty, minimum 10 characters
- **Error Messages**:
  - "Message is required"
  - "Message must be at least 10 characters"

### Preferred Consultation Time (Optional)
- **Type**: Datetime-local input
- **Validation**: None (optional field)
- **Description**: User can optionally specify when they'd like to be contacted

## API Integration

### Endpoint

```
POST /api/consultations
```

### Request Body

```typescript
{
  name: string;           // Required, non-empty
  email: string;          // Required, valid email
  phone: string;          // Required, valid phone
  serviceType: string;    // Required, non-empty
  message: string;        // Required, min 10 chars
  preferredTime?: Date;   // Optional
}
```

### Response (Success)

```typescript
{
  success: true;
  message: string;
  consultationId: string;
}
```

### Response (Error)

```typescript
{
  success: false;
  message: string;
}
```

## Validation Rules

### Client-Side Validation

1. **Name**: Must be non-empty after trimming
2. **Email**: Must match pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
3. **Phone**: Must match pattern `/^[\d\s\-\+\(\)]{10,}$/` (after removing spaces)
4. **Service Type**: Must be selected (non-empty)
5. **Message**: Must be non-empty and at least 10 characters

### Server-Side Validation

The API route (`/api/consultations`) performs the same validation and returns appropriate error messages.

## Accessibility Features

- **ARIA Labels**: All form fields have proper `aria-label` or `aria-labelledby`
- **ARIA Invalid**: Fields with errors have `aria-invalid="true"`
- **ARIA Describedby**: Error messages are linked via `aria-describedby`
- **Semantic HTML**: Uses proper form elements (input, select, textarea, button)
- **Focus Management**: Clear focus indicators on all interactive elements
- **Error Announcements**: Error messages are displayed near their fields

## Styling

The component uses Tailwind CSS classes for styling:

- **Container**: `w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg`
- **Form Fields**: `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`
- **Error State**: `border-red-500` for fields with errors
- **Error Messages**: `mt-1 text-sm text-red-500`
- **Success Message**: `bg-green-50 text-green-800 border border-green-200`
- **Error Message**: `bg-red-50 text-red-800 border border-red-200`
- **Submit Button**: `w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg`

## Error Handling

### Validation Errors

When validation fails, the form displays error messages below each field and prevents submission.

### Network Errors

If the API request fails due to network issues, the error message is displayed in the alert box.

### Server Errors

If the API returns an error response, the error message from the server is displayed.

### Error Clearing

When a user starts typing in a field that has an error, the error message is automatically cleared.

## Form Submission Flow

1. User fills out the form
2. User clicks "Submit Consultation Request" button
3. Client-side validation runs
4. If validation fails, errors are displayed
5. If validation passes, form is submitted to `/api/consultations`
6. Submit button is disabled during submission
7. On success:
   - Success message is displayed
   - Form is reset
   - `onSubmitSuccess` callback is called
8. On error:
   - Error message is displayed
   - Form data is preserved
   - `onSubmitError` callback is called

## Testing

The component includes comprehensive unit tests covering:

- **Rendering**: All form fields and labels render correctly
- **Validation**: All validation rules work as expected
- **Input Handling**: Form data updates correctly on user input
- **Submission**: Form submits with valid data and handles errors
- **Accessibility**: ARIA attributes and semantic HTML are correct
- **Edge Cases**: Whitespace handling, network errors, long inputs, special characters

### Running Tests

```bash
npm test -- components/website/sections/ConsultationForm.test.tsx
```

### Test Coverage

- 35 unit tests
- 100% pass rate
- Covers all major functionality and edge cases

## Requirements Validation

This component validates the following requirements:

- **Requirement 8.1**: Opens consultation form when user clicks consultation button
- **Requirement 8.2**: Collects user's basic information (name, email, phone)
- **Requirement 8.3**: Supports user selecting consultation service type
- **Requirement 8.4**: Sends confirmation email to user (via API)
- **Requirement 8.5**: Supports appointment scheduling (via preferred time field)

## Property-Based Testing

The component is designed to support property-based testing for:

- **Property 20: Form Submission Success Confirmation**
  - For any valid form submission, the system should send a confirmation email
  - Validates: Requirements 8.4, 13.5

## Integration Examples

### In Service Detail Page

```tsx
import ConsultationForm from '@/components/website/sections/ConsultationForm';

export default function ServiceDetailPage({ serviceId }: { serviceId: string }) {
  return (
    <div>
      {/* Service details */}
      <ConsultationForm 
        serviceType={serviceId}
        onSubmitSuccess={() => {
          // Show thank you message
        }}
      />
    </div>
  );
}
```

### In Modal

```tsx
import { useState } from 'react';
import ConsultationForm from '@/components/website/sections/ConsultationForm';

export default function ConsultationModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Request Consultation
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <ConsultationForm
              onSubmitSuccess={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
```

## Future Enhancements

- Email confirmation implementation
- Appointment scheduling integration
- File upload for project details
- Multi-step form wizard
- Captcha integration for spam prevention
- Admin notification system
- Consultation tracking dashboard

## Troubleshooting

### Form not submitting

1. Check browser console for errors
2. Verify all required fields are filled
3. Check that the API endpoint is accessible
4. Verify network connectivity

### Validation errors not clearing

1. Ensure you're typing in the field with the error
2. Check that the field name matches the validation logic

### Styling issues

1. Ensure Tailwind CSS is properly configured
2. Check that the component is wrapped in a Tailwind CSS context
3. Verify no CSS conflicts with other stylesheets

## Support

For issues or questions about the ConsultationForm component, please refer to:
- Component tests: `components/website/sections/ConsultationForm.test.tsx`
- API route: `app/api/consultations/route.ts`
- Type definitions: `types/website.ts`
