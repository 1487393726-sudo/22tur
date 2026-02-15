# Enterprise Admin System

A comprehensive internal management and operations platform for enterprise administration, featuring user management, order management, product management, financial management, permission management, system settings, audit logging, and reporting capabilities.

## Project Structure

```
lib/enterprise-admin/
├── types/
│   └── index.ts              # Core type definitions
├── constants/
│   └── index.ts              # System constants and configurations
├── utils/
│   └── index.ts              # Utility functions
├── auth/
│   ├── authentication-service.ts    # User authentication
│   └── authorization-service.ts     # RBAC and permission management
├── audit/
│   └── audit-log-service.ts         # Audit logging and tracking
├── index.ts                  # Main export file
└── README.md                 # This file
```

## Core Features

### 1. Authentication Service (`AuthenticationService`)

Handles user authentication and session management.

**Key Methods:**
- `registerUser(username, email, password, roles)` - Register a new user
- `authenticate(username, password)` - Authenticate user and create session
- `validateSession(sessionId)` - Validate an active session
- `logout(sessionId)` - Logout a user
- `changePassword(userId, oldPassword, newPassword)` - Change user password
- `resetPassword(userId, newPassword)` - Reset user password (admin)
- `assignRoles(userId, roles)` - Assign roles to a user
- `getUserPermissions(userId)` - Get all permissions for a user

**Example Usage:**
```typescript
import { authService } from 'lib/enterprise-admin';

// Register a new user
const user = authService.registerUser('john_doe', 'john@example.com', 'password123');

// Authenticate user
const authContext = authService.authenticate('john_doe', 'password123');

// Validate session
const session = authService.validateSession(sessionId);

// Change password
authService.changePassword(userId, 'oldPassword', 'newPassword');
```

### 2. Authorization Service (`AuthorizationService`)

Implements Role-Based Access Control (RBAC) with permission management.

**Key Methods:**
- `createRole(name, description, parentRole)` - Create a new role
- `createPermission(name, resource, action, description)` - Create a permission
- `assignPermissionToRole(roleId, permissionId)` - Assign permission to role
- `hasPermission(user, resource, action)` - Check if user has permission
- `validatePermission(user, resource, action)` - Validate permission (throws error if denied)
- `hasRole(user, roleName)` - Check if user has role
- `getRolePermissions(role)` - Get all permissions for a role (including inherited)
- `getUserPermissions(user)` - Get all permissions for a user

**Example Usage:**
```typescript
import { authorizationService } from 'lib/enterprise-admin';

// Create roles
const adminRole = authorizationService.createRole('admin', 'Administrator');
const userRole = authorizationService.createRole('user', 'Regular User');

// Create permissions
const viewUsersPermission = authorizationService.createPermission(
  'view_users',
  'USER',
  'view',
  'View users'
);

// Assign permission to role
authorizationService.assignPermissionToRole(adminRole.id, viewUsersPermission.id);

// Check permissions
if (authorizationService.hasPermission(user, 'USER', 'view')) {
  // User can view users
}

// Validate permission (throws error if denied)
authorizationService.validatePermission(user, 'USER', 'delete');
```

### 3. Audit Log Service (`AuditLogService`)

Records and manages all user operations and system events.

**Key Methods:**
- `recordAuditLog(userId, action, resource, resourceId, changes, ipAddress, userAgent, status, errorMessage)` - Record an operation
- `recordLoginLog(userId, ipAddress, userAgent, status, failureReason)` - Record login event
- `recordLogoutLog(loginLogId)` - Record logout event
- `filterAuditLogs(criteria)` - Filter logs by various criteria
- `searchAuditLogs(keyword)` - Search logs by keyword
- `getUserAuditLogs(userId)` - Get all logs for a user
- `getResourceAuditLogs(resource, resourceId)` - Get logs for a resource
- `getFailedOperations()` - Get all failed operations
- `generateAuditReport(startDate, endDate)` - Generate audit report
- `getAuditLogsPaginated(page, pageSize)` - Get paginated logs

**Example Usage:**
```typescript
import { auditLogService } from 'lib/enterprise-admin';

// Record an operation
auditLogService.recordAuditLog(
  'user1',
  'CREATE',
  'USER',
  'user2',
  { name: 'John Doe', email: 'john@example.com' },
  '192.168.1.1',
  'Mozilla/5.0',
  'success'
);

// Record login
auditLogService.recordLoginLog('user1', '192.168.1.1', 'Mozilla/5.0', 'success');

// Filter logs
const logs = auditLogService.filterAuditLogs({
  userId: 'user1',
  action: 'CREATE',
  status: 'success',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});

// Generate report
const report = auditLogService.generateAuditReport(
  new Date('2024-01-01'),
  new Date('2024-12-31')
);
```

## Type Definitions

### User
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  ipAddress?: string;
}
```

### Role
```typescript
interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  parentRole?: Role;
  parentRoleId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Permission
```typescript
interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: Date;
}
```

### AuditLog
```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}
```

## Constants

### Order Status Configuration
```typescript
ORDER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#ffc107', icon: 'clock' },
  confirmed: { label: 'Confirmed', color: '#17a2b8', icon: 'check-circle' },
  shipped: { label: 'Shipped', color: '#007bff', icon: 'truck' },
  delivered: { label: 'Delivered', color: '#28a745', icon: 'check-double' },
  cancelled: { label: 'Cancelled', color: '#dc3545', icon: 'times-circle' }
}
```

### Valid Order Transitions
```typescript
VALID_ORDER_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: []
}
```

### Audit Actions
```typescript
AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  PERMISSION_CHANGE: 'PERMISSION_CHANGE',
  ROLE_CHANGE: 'ROLE_CHANGE'
}
```

## Utility Functions

The system provides a comprehensive set of utility functions:

### Validation Functions
- `validateRequired(value, fieldName)` - Validate required field
- `validateEmail(email)` - Validate email format
- `validateId(id, fieldName)` - Validate ID format
- `validateNumberRange(value, min, max, fieldName)` - Validate number range
- `validateEnum(value, allowedValues, fieldName)` - Validate enum value

### Data Manipulation
- `generateId()` - Generate unique ID
- `deepClone(obj)` - Deep clone object
- `mergeObjects(target, source)` - Merge objects
- `groupBy(array, key)` - Group array by key
- `sortBy(array, key, order)` - Sort array
- `filterBy(array, criteria)` - Filter array
- `paginate(array, page, pageSize)` - Paginate array
- `removeDuplicates(array)` - Remove duplicates

### String Functions
- `capitalize(str)` - Capitalize first letter
- `toTitleCase(str)` - Convert to title case
- `truncateString(str, maxLength)` - Truncate string

### Date Functions
- `formatDate(date)` - Format date to ISO string
- `parseDate(dateString)` - Parse date string
- `isPastDate(date)` - Check if date is in past
- `isFutureDate(date)` - Check if date is in future
- `dateDifferenceInDays(date1, date2)` - Calculate date difference

### Number Functions
- `formatCurrency(amount, currency)` - Format as currency
- `formatNumber(value, decimals)` - Format with separators
- `calculatePercentageChange(oldValue, newValue)` - Calculate percentage change

### Async Functions
- `delay(ms)` - Delay execution
- `retryWithBackoff(fn, maxAttempts, initialDelayMs)` - Retry with backoff
- `debounce(fn, delayMs)` - Debounce function
- `throttle(fn, delayMs)` - Throttle function

## Error Handling

The system provides custom error classes:

```typescript
// Base error
class EnterpriseAdminError extends Error {
  code: string;
  statusCode: number;
  details?: Record<string, any>;
}

// Authentication error
class AuthenticationError extends EnterpriseAdminError {
  // statusCode: 401
}

// Authorization error
class AuthorizationError extends EnterpriseAdminError {
  // statusCode: 403
}

// Validation error
class ValidationError extends EnterpriseAdminError {
  // statusCode: 400
}

// Not found error
class NotFoundError extends EnterpriseAdminError {
  // statusCode: 404
}
```

## Testing

The system includes comprehensive unit tests for all core services:

- `__tests__/lib/enterprise-admin/auth/authentication-service.test.ts` - 30 tests
- `__tests__/lib/enterprise-admin/auth/authorization-service.test.ts` - 27 tests
- `__tests__/lib/enterprise-admin/audit/audit-log-service.test.ts` - 28 tests
- `__tests__/lib/enterprise-admin/utils/index.test.ts` - 58 tests

**Run tests:**
```bash
npm test -- __tests__/lib/enterprise-admin
```

## Requirements Validation

This implementation validates the following requirements:

- **Requirement 1.1**: Project structure with core data models and interfaces ✓
- **Requirement 2.1**: User management foundation ✓
- **Requirement 3.1**: Order management foundation ✓
- **Requirement 6.1**: Role management ✓
- **Requirement 6.2**: Permission configuration ✓
- **Requirement 6.3**: User role assignment ✓
- **Requirement 6.4**: Permission validation ✓
- **Requirement 8.1**: Audit log recording ✓
- **Requirement 8.2**: Login log recording ✓
- **Requirement 15.6**: Audit trail for all operations ✓

## Next Steps

The following modules are ready to be implemented:

1. **Shared Components** (Task 2)
   - Data Table Component
   - Admin Form Component
   - Status Badge Component
   - Search & Filter Component
   - Export Component
   - Navigation Menu Component

2. **Dashboard Module** (Task 3)
   - Dashboard Widget Component
   - Real-time data updates
   - Custom dashboard layouts

3. **Feature Modules** (Tasks 4-11)
   - User Management
   - Order Management
   - Product Management
   - Financial Management
   - Permission Management
   - System Settings
   - Audit Log UI
   - Report Analysis

## License

This is part of the Enterprise Admin System project.
