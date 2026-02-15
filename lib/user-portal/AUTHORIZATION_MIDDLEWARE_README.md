# Authorization Middleware Documentation

## Overview

The Authorization Middleware provides role-based access control (RBAC) for the User Portal System. It implements endpoint protection, role validation, and resource ownership checks to ensure secure API access.

**Validates: Requirements 1.5**

## Features

- **Role-Based Access Control (RBAC)**: Define which roles can access specific endpoints
- **Token Verification**: Validate JWT tokens and extract user context
- **Multiple Authorization Strategies**: Support for different authorization patterns
- **Role Hierarchy**: Implement role hierarchy for permission inheritance
- **Resource Ownership**: Check if user owns a resource before granting access
- **Flexible Middleware**: Support for required, optional, and conditional authentication

## User Roles

The system defines five user roles with a hierarchy:

```
ADMIN (Level 4)
  ↓
ADVISOR (Level 3)
  ↓
EMPLOYEE (Level 2)
  ↓
INVESTOR (Level 1)
  ↓
USER (Level 0)
```

### Role Descriptions

- **ADMIN**: Full system access, can manage all resources and users
- **ADVISOR**: Can advise clients and manage their own resources
- **EMPLOYEE**: Can manage assigned tasks and resources
- **INVESTOR**: Can view investment opportunities and manage portfolio
- **USER**: Regular user with access to personal resources only

## Core Components

### AuthorizationContext

Contains user information extracted from JWT token:

```typescript
interface AuthorizationContext {
  userId: string;
  email: string;
  role: UserRole;
  isAuthenticated: boolean;
  token?: string;
}
```

### EndpointPermission

Defines access requirements for an endpoint:

```typescript
interface EndpointPermission {
  path: string;
  method: string;
  allowedRoles: UserRole[];
  requiresAuth: boolean;
}
```

## Usage Examples

### 1. Protected Endpoint (Requires Authentication)

```typescript
import { AuthorizationMiddleware, AuthorizationContext } from '@/lib/user-portal/authorization-middleware';
import { NextRequest, NextResponse } from 'next/server';

export const GET = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: AuthorizationContext) => {
    // User is authenticated
    return NextResponse.json({
      success: true,
      userId: context.userId,
      role: context.role,
    });
  }
);
```

### 2. Admin-Only Endpoint

```typescript
import { AuthorizationMiddleware, UserRole } from '@/lib/user-portal/authorization-middleware';

export const POST = AuthorizationMiddleware.authorize([UserRole.ADMIN])(
  async (request: NextRequest, context: AuthorizationContext) => {
    // Only ADMIN users can access this endpoint
    return NextResponse.json({
      success: true,
      message: 'Admin action completed',
    });
  }
);
```

### 3. Multiple Roles Allowed

```typescript
export const GET = AuthorizationMiddleware.authorize([
  UserRole.ADMIN,
  UserRole.EMPLOYEE,
  UserRole.ADVISOR,
])(
  async (request: NextRequest, context: AuthorizationContext) => {
    // ADMIN, EMPLOYEE, or ADVISOR can access
    return NextResponse.json({
      success: true,
      data: context,
    });
  }
);
```

### 4. Optional Authentication

```typescript
export const GET = AuthorizationMiddleware.optionalAuth(
  async (request: NextRequest, context: AuthorizationContext | null) => {
    if (context) {
      // User is authenticated
      return NextResponse.json({
        authenticated: true,
        userId: context.userId,
      });
    } else {
      // User is not authenticated
      return NextResponse.json({
        authenticated: false,
      });
    }
  }
);
```

### 5. Resource Ownership Check

```typescript
export const GET = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: AuthorizationContext) => {
    const resourceOwnerId = request.nextUrl.searchParams.get('ownerId');

    // Check if user owns the resource
    if (!AuthorizationMiddleware.isResourceOwner(context, resourceOwnerId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Access denied',
          error: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // User owns the resource, proceed
    return NextResponse.json({
      success: true,
      data: 'Resource data',
    });
  }
);
```

### 6. Role Hierarchy Check

```typescript
export const GET = AuthorizationMiddleware.authenticate(
  async (request: NextRequest, context: AuthorizationContext) => {
    // Check if user has at least EMPLOYEE level permissions
    if (!AuthorizationMiddleware.hasHigherOrEqualRole(context, UserRole.EMPLOYEE)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Insufficient permissions',
          error: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: 'Employee data',
    });
  }
);
```

## API Reference

### Token Extraction

```typescript
// Extract Bearer token from request
const token = AuthorizationMiddleware.extractToken(request);
```

### Token Verification

```typescript
// Verify token and extract context
const context = AuthorizationMiddleware.verifyTokenAndExtractContext(token);
```

### Role Checks

```typescript
// Check if user has specific role
AuthorizationMiddleware.hasRole(context, [UserRole.ADMIN]);

// Check if user has any of the roles
AuthorizationMiddleware.hasAnyRole(context, [UserRole.ADMIN, UserRole.EMPLOYEE]);

// Check if user has all roles
AuthorizationMiddleware.hasAllRoles(context, [UserRole.ADMIN]);
```

### Role-Specific Checks

```typescript
// Check specific roles
AuthorizationMiddleware.isAdmin(context);
AuthorizationMiddleware.isEmployee(context);
AuthorizationMiddleware.isRegularUser(context);
AuthorizationMiddleware.isInvestor(context);
AuthorizationMiddleware.isAdvisor(context);
```

### Resource Ownership

```typescript
// Check if user owns resource
AuthorizationMiddleware.isResourceOwner(context, resourceOwnerId);
```

### Role Hierarchy

```typescript
// Get role hierarchy level
const level = AuthorizationMiddleware.getRoleHierarchyLevel(UserRole.ADMIN); // Returns 4

// Check if user has higher or equal role
AuthorizationMiddleware.hasHigherOrEqualRole(context, UserRole.EMPLOYEE);
```

### Endpoint Permission Validation

```typescript
// Validate endpoint permission
const permission: EndpointPermission = {
  path: '/api/admin',
  method: 'GET',
  allowedRoles: [UserRole.ADMIN],
  requiresAuth: true,
};

AuthorizationMiddleware.validateEndpointPermission(context, permission);
```

## Error Responses

### 401 Unauthorized

Returned when:
- Authorization header is missing
- Token is invalid or expired
- Token verification fails

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": "INVALID_TOKEN"
}
```

### 403 Forbidden

Returned when:
- User is authenticated but lacks required role
- User does not own the resource
- User lacks sufficient permissions

```json
{
  "success": false,
  "message": "Insufficient permissions",
  "error": "INSUFFICIENT_PERMISSIONS"
}
```

## Security Considerations

1. **Token Storage**: Store tokens securely in HTTP-only cookies or secure storage
2. **Token Expiration**: Implement token expiration and refresh mechanisms
3. **HTTPS Only**: Always use HTTPS in production to prevent token interception
4. **Role Validation**: Validate roles on every request, don't cache role information
5. **Resource Ownership**: Always verify resource ownership before granting access
6. **Audit Logging**: Log all authorization failures for security monitoring

## Testing

### Unit Tests

Run unit tests for authorization middleware:

```bash
npm test -- __tests__/lib/user-portal/authorization-middleware.test.ts
```

### Property-Based Tests

Run property-based tests to verify authorization properties:

```bash
npm test -- __tests__/properties/user-portal/authorization.property.test.ts
```

## Integration with Authentication

The authorization middleware works with the authentication service:

1. **Authentication Service** generates JWT tokens with user role
2. **Authorization Middleware** verifies tokens and extracts context
3. **Endpoint Handlers** use context to make authorization decisions

## Best Practices

1. **Use Specific Roles**: Be specific about which roles can access endpoints
2. **Fail Secure**: Default to denying access if authorization fails
3. **Check Ownership**: Always verify resource ownership for user-specific resources
4. **Log Failures**: Log authorization failures for security monitoring
5. **Use Hierarchy**: Leverage role hierarchy for permission inheritance
6. **Validate Input**: Validate all user input before using in authorization checks

## Troubleshooting

### Token Not Being Extracted

- Ensure Authorization header is in format: `Bearer <token>`
- Check that token is not empty or malformed

### User Lacks Required Role

- Verify user's role in database matches expected role
- Check role hierarchy if using `hasHigherOrEqualRole`
- Ensure endpoint permission configuration is correct

### Resource Ownership Check Failing

- Verify resource owner ID matches user ID
- Check that user ID is correctly extracted from token
- Ensure resource owner ID is correctly passed to check

## Future Enhancements

1. **Permission-Based Access Control**: Implement fine-grained permissions
2. **Dynamic Role Assignment**: Support dynamic role assignment per endpoint
3. **Rate Limiting**: Add rate limiting based on user role
4. **Audit Trail**: Implement comprehensive audit logging
5. **OAuth Integration**: Support OAuth providers for authentication
