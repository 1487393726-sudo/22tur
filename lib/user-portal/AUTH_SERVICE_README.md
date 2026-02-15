# User Portal Authentication Service

## Overview

The User Portal Authentication Service provides comprehensive JWT-based authentication and session management for the User Portal System. It handles user login, logout, token generation, token refresh, and session validation.

**Validates: Requirements 1.5**

## Features

- **JWT Token Generation**: Secure token generation with configurable expiry
- **Refresh Token Support**: Long-lived refresh tokens for session extension
- **Session Management**: Create, validate, and manage user sessions
- **Password Hashing**: Bcrypt-based password hashing and verification
- **Account Lockout**: Brute-force protection with configurable lockout duration
- **Multi-identifier Login**: Support for email, phone, and username login
- **Token Validation**: Verify and validate JWT tokens
- **Session Cleanup**: Automatic cleanup of expired sessions

## Architecture

### Components

1. **AuthenticationService** (`lib/user-portal/auth-service.ts`)
   - JWT token generation and verification
   - User login and logout
   - Password hashing and verification
   - Session validation
   - Account lockout management

2. **SessionManagementService** (`lib/user-portal/session-service.ts`)
   - Session creation and management
   - Session validation and expiration checking
   - Session cleanup and invalidation
   - Activity tracking

3. **API Endpoints**
   - `POST /api/user-portal/auth/login` - User login
   - `POST /api/user-portal/auth/logout` - User logout
   - `POST /api/user-portal/auth/refresh` - Refresh access token
   - `GET /api/user-portal/auth/verify` - Verify session

## Usage

### Login

```typescript
import { AuthenticationService } from '@/lib/user-portal/auth-service';

const result = await AuthenticationService.login({
  identifier: 'user@example.com', // email, phone, or username
  password: 'password123'
});

if (result.success) {
  console.log('Token:', result.token);
  console.log('Refresh Token:', result.refreshToken);
  console.log('Session:', result.session);
}
```

### Logout

```typescript
const result = await AuthenticationService.logout(userId);

if (result.success) {
  console.log('Logged out successfully');
}
```

### Verify Token

```typescript
const payload = AuthenticationService.verifyToken(token);

if (payload) {
  console.log('User ID:', payload.userId);
  console.log('Email:', payload.email);
  console.log('Role:', payload.role);
}
```

### Validate Session

```typescript
const session = await AuthenticationService.validateSession(token);

if (session) {
  console.log('Session is valid');
  console.log('User:', session.name);
  console.log('Expires at:', session.expiresAt);
}
```

### Refresh Token

```typescript
const result = await AuthenticationService.refreshAccessToken(refreshToken);

if (result.token) {
  console.log('New token:', result.token);
} else {
  console.log('Error:', result.error);
}
```

## API Endpoints

### POST /api/user-portal/auth/login

Login with credentials.

**Request:**
```json
{
  "identifier": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "session": {
    "userId": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00Z",
    "expiresAt": "2024-01-02T00:00:00Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "INVALID_CREDENTIALS"
}
```

### POST /api/user-portal/auth/logout

Logout user and invalidate session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### POST /api/user-portal/auth/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET /api/user-portal/auth/verify

Verify current session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Session is valid",
  "session": {
    "userId": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00Z",
    "expiresAt": "2024-01-02T00:00:00Z"
  }
}
```

## Configuration

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=7d

# Security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=15m
```

## Security Features

### Password Security
- Bcrypt hashing with salt rounds of 10
- Secure password comparison to prevent timing attacks
- Password verification before token generation

### Token Security
- JWT tokens with configurable expiry
- Separate refresh tokens with longer expiry
- Token verification on every request
- Secure HTTP-only cookies for refresh tokens

### Account Protection
- Brute-force protection with configurable lockout
- Failed login attempt tracking
- Automatic lockout after max attempts
- Lockout duration of 15 minutes (configurable)

### Session Management
- Session creation with IP and user agent tracking
- Session expiration checking
- Inactivity timeout (30 minutes)
- Session invalidation on logout

## Error Handling

### Error Codes

| Error Code | Description |
|-----------|-------------|
| MISSING_CREDENTIALS | Missing identifier or password |
| INVALID_CREDENTIALS | Invalid email/password combination |
| ACCOUNT_LOCKED | Account locked due to too many failed attempts |
| MISSING_AUTH_HEADER | Missing authorization header |
| INVALID_TOKEN | Invalid or expired token |
| INVALID_SESSION | Invalid or expired session |
| MISSING_REFRESH_TOKEN | Missing refresh token |
| TOKEN_REFRESH_ERROR | Error refreshing token |
| USER_NOT_FOUND | User not found |
| LOGIN_ERROR | General login error |
| INTERNAL_ERROR | Internal server error |

## Testing

### Unit Tests

Run unit tests for authentication service:

```bash
npm test -- __tests__/lib/user-portal/auth-service.test.ts
```

Run unit tests for session management:

```bash
npm test -- __tests__/lib/user-portal/session-service.test.ts
```

### Integration Tests

Run integration tests:

```bash
npm test -- __tests__/api/user-portal/auth.integration.test.ts
```

### Test Coverage

- Token generation and verification
- Login and logout flows
- Password hashing and verification
- Session creation and validation
- Token refresh
- Error handling
- Account lockout

## Best Practices

1. **Always use HTTPS** in production to protect tokens in transit
2. **Store refresh tokens securely** in HTTP-only cookies
3. **Validate tokens on every request** to protected endpoints
4. **Implement token rotation** for enhanced security
5. **Monitor failed login attempts** for security threats
6. **Use strong JWT secrets** with sufficient entropy
7. **Implement rate limiting** on login endpoints
8. **Log authentication events** for audit trails

## Performance Considerations

- Token verification is O(1) operation
- Password hashing uses bcrypt with configurable rounds
- Session lookup is O(1) with proper indexing
- Token refresh is fast with minimal database queries

## Future Enhancements

- Multi-factor authentication (MFA)
- OAuth2/OpenID Connect integration
- Social login providers
- Passwordless authentication
- Biometric authentication
- Device fingerprinting
- Anomaly detection
- Session management dashboard

## References

- [JWT.io](https://jwt.io/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
