# Authentication Integration Guide

This document describes the role-based authentication and authorization system integrated into the Fabriventory frontend application.

## Overview

The authentication system integrates with the `fabriventory-auth` microservice to provide:

- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based UI components
- User and role management interfaces
- Secure token management with automatic refresh

## Architecture

### Core Components

1. **AuthContext** (`contexts/auth-context.tsx`)
   - Manages authentication state
   - Provides authentication methods (login, logout, register)
   - Handles token refresh automatically
   - Provides permission checking utilities

2. **AuthAPI Service** (`lib/api/auth.ts`)
   - Handles all API communication with the auth service
   - Manages JWT tokens (access and refresh)
   - Provides typed interfaces for all auth endpoints

3. **Type Definitions** (`lib/types/auth.ts`)
   - TypeScript interfaces for all auth-related data
   - Predefined roles and permissions
   - API request/response types

### Guard Components

1. **RoleGuard** (`components/auth/role-guard.tsx`)
   - Protects components based on user roles
   - Convenience components for common role checks

2. **PermissionGuard** (`components/auth/permission-guard.tsx`)
   - Protects components based on specific permissions
   - Convenience components for common permission checks

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Frontend Port Configuration
PORT=3900

# Auth Service API URL
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8081/api/v1

# Development settings
NODE_ENV=development
```

### 2. Start the Auth Service

Make sure the `fabriventory-auth` service is running on port 8081:

```bash
cd fabriventory-auth
make run
```

### 3. Start the Frontend

```bash
cd fabriventory-frontend
npm run dev
```

The frontend will be available at http://localhost:3900

## Usage Examples

### Authentication

```tsx
import { useAuth } from '@/contexts/auth-context'

function LoginComponent() {
  const { login, user, isAuthenticated } = useAuth()
  
  const handleLogin = async () => {
    await login({ username: 'user@example.com', password: 'password' })
  }
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.first_name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  )
}
```

### Role-Based Access Control

```tsx
import { SuperAdminGuard, AdminGuard } from '@/components/auth/role-guard'

function AdminPanel() {
  return (
    <AdminGuard>
      <div>This content is only visible to admins and super admins</div>
    </AdminGuard>
  )
}

function SuperAdminPanel() {
  return (
    <SuperAdminGuard>
      <div>This content is only visible to super admins</div>
    </SuperAdminGuard>
  )
}
```

### Permission-Based Access Control

```tsx
import { PermissionGuard } from '@/components/auth/permission-guard'

function UserManagement() {
  return (
    <PermissionGuard permissions={[{ resource: 'user', action: 'manage' }]}>
      <div>User management interface</div>
    </PermissionGuard>
  )
}
```

### Using Permission Hooks

```tsx
import { useUserManagement, useRoleManagement } from '@/contexts/auth-context'

function NavigationMenu() {
  const canManageUsers = useUserManagement()
  const canManageRoles = useRoleManagement()
  
  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      {canManageUsers && <a href="/dashboard/users">Users</a>}
      {canManageRoles && <a href="/dashboard/roles">Roles</a>}
    </nav>
  )
}
```

## Predefined Roles

1. **super_admin** - Full system access
2. **admin** - Administrative access
3. **manager** - Management access
4. **user** - Regular user access
5. **viewer** - Read-only access

## Navigation Structure

The dashboard navigation is automatically filtered based on user roles:

- **Dashboard**: All roles
- **Buyers, Suppliers, Items, Sales Contracts, Purchase Invoices, Inventory Transactions**: super_admin, admin, manager, user
- **Reports**: super_admin, admin, manager
- **User Management**: super_admin, admin
- **Role Management**: super_admin only
- **Settings**: super_admin, admin

## User Management Features

### For Super Admins and Admins

- View all users with filtering and search
- Create new users with role assignment
- Edit user information and roles
- Activate/deactivate user accounts
- Delete users (except self)

### For Super Admins Only

- Create and manage roles
- Assign permissions to roles
- Delete roles
- Full system administration

## Security Features

1. **Automatic Token Refresh**: Access tokens are automatically refreshed before expiry
2. **Secure Storage**: Tokens are stored in localStorage with proper cleanup
3. **Route Protection**: All dashboard routes are protected by authentication guards
4. **Permission Validation**: All sensitive operations validate permissions on both client and server
5. **Error Handling**: Comprehensive error handling with user-friendly messages

## API Integration

The system integrates with the following auth service endpoints:

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `GET /users` - List users (with filtering)
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /roles` - List roles
- `POST /roles` - Create role
- `PUT /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role

## Error Handling

The system provides comprehensive error handling:

- Network errors are caught and displayed to users
- Authentication errors redirect to login
- Permission errors show appropriate messages
- API errors are logged for debugging

## Development Notes

1. **Type Safety**: All API calls are fully typed with TypeScript
2. **Error Boundaries**: Consider adding error boundaries for better error handling
3. **Loading States**: All async operations show loading states
4. **Responsive Design**: All components are mobile-responsive
5. **Accessibility**: Components follow accessibility best practices

## Testing

To test the authentication system:

1. Start both the auth service and frontend
2. Register a new user or use existing credentials
3. Test different role assignments
4. Verify permission-based access control
5. Test token refresh functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the auth service allows requests from the frontend domain
2. **Token Expiry**: Check that token refresh is working properly
3. **Permission Errors**: Verify that roles and permissions are correctly assigned
4. **API Connection**: Ensure the auth service is running and accessible

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment file.
