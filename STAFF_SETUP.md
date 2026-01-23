# Staff Management System

This document explains how to set up and use the staff management functionality.

## Database Setup

1. Run the staff table creation from `complete_database_schema.sql`
2. Run the sample data insertion from `sql-migrations/add_sample_staff.sql`

## Features

### Staff Management
- **Location**: `/staff`
- **Permissions**: Admin only
- **Features**: 
  - View all staff members
  - Add new staff members
  - Edit existing staff
  - Activate/deactivate staff
  - Delete staff members

### Staff Authentication
- **Login Page**: `/staff-login`
- **Dashboard**: `/staff-dashboard`
- **Features**:
  - JWT-based authentication
  - Role-based access control
  - Session management

## API Endpoints

### Staff CRUD Operations
- `GET /api/staff` - Get all staff members
- `POST /api/staff` - Create new staff member
- `GET /api/staff/[id]` - Get specific staff member
- `PUT /api/staff/[id]` - Update staff member
- `DELETE /api/staff/[id]` - Delete staff member

### Staff Authentication
- `POST /api/auth/staff/login` - Staff login
- `GET /api/auth/staff/me` - Get current staff user

## Sample Accounts

All sample accounts use the password: `password123`

### Manager Account
- **Email**: manager@company.com
- **Role**: Manager
- **Status**: Active

### Staff Accounts
- **Email**: sarah@company.com (Active)
- **Email**: mike@company.com (Active)  
- **Email**: emma@company.com (Inactive)

## Usage

1. **Admin Access**: Use the main admin login to access `/staff` for staff management
2. **Staff Access**: Use `/staff-login` for staff members to access their dashboard
3. **Role Management**: Managers and Staff have different permission levels

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Session management
- Input validation

## Next Steps

- Add order assignment to staff members
- Implement staff activity tracking
- Add staff performance metrics
- Create staff scheduling features
