# Flight School Admin Features Specification

## Overview
This document outlines the admin functionality for managing flight school information in the AirSchool platform.

## Current Data Structure Analysis

### 1. Flight School Information
- **Basic Information**
  - ID (unique identifier)
  - Name
  - Location (full address)
  - City
  - Country
  - Short description
  - Full description

- **Media**
  - Main image URL
  - Gallery images (array of URLs)

- **Ratings & Reviews**
  - Average rating (1-5)
  - Review count
  - Individual reviews with user info, rating, title, content, date

- **Features & Facilities**
  - List of features (e.g., "Latest Simulators", "1-on-1 Training", "Dormitory Available")

- **Contact Information**
  - Phone number
  - Email address
  - Website URL
  - Physical address

### 2. Training Programs
- Program ID
- Program name
- Duration
- Description
- Associated school ID

### 3. Reviews
- Review ID
- School ID (foreign key)
- User name
- User avatar
- Rating (1-5)
- Title
- Content
- Date
- Helpful votes count

## Admin Features to Implement

### 1. Flight School Management
#### Create/Edit/Delete School
- [ ] Add new flight school
- [ ] Edit existing school information
- [ ] Delete school (with confirmation)
- [ ] Bulk import schools (CSV/JSON)

#### Information Fields
- [ ] Basic info (name, location, city, country)
- [ ] Descriptions (short and full)
- [ ] Contact details
- [ ] Features management (add/remove/edit)
- [ ] Image upload and management
- [ ] Gallery management

### 2. Program Management
#### Create/Edit/Delete Programs
- [ ] Add new training program
- [ ] Edit program details
- [ ] Delete program
- [ ] Associate programs with schools
- [ ] Reorder programs display

### 3. Review Management
#### Review Moderation
- [ ] View all reviews
- [ ] Approve/reject reviews
- [ ] Edit review content
- [ ] Delete inappropriate reviews
- [ ] Reply to reviews as admin
- [ ] Flag/unflag reviews

### 4. Media Management
#### Image Handling
- [ ] Upload images to cloud storage
- [ ] Image optimization (resize, compress)
- [ ] Set primary image
- [ ] Manage gallery order
- [ ] Delete images
- [ ] Image URL validation

### 5. Analytics & Reports
- [ ] View school statistics
- [ ] Review analytics
- [ ] User engagement metrics
- [ ] Popular schools report
- [ ] Program enrollment trends

### 6. Bulk Operations
- [ ] Bulk update schools
- [ ] Export data (CSV/JSON)
- [ ] Import data
- [ ] Batch image upload
- [ ] Bulk status changes

## Database Schema Design

### Tables Required

#### 1. flight_schools
```sql
- id (UUID, PK)
- name (VARCHAR)
- location (VARCHAR)
- city (VARCHAR)
- country (VARCHAR)
- rating (DECIMAL)
- review_count (INTEGER)
- description (TEXT)
- short_description (TEXT)
- image (VARCHAR)
- gallery (JSONB/Array)
- features (JSONB/Array)
- phone (VARCHAR)
- email (VARCHAR)
- website (VARCHAR)
- address (VARCHAR)
- status (ENUM: active, inactive, pending)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- created_by (UUID, FK to admin_users)
- updated_by (UUID, FK to admin_users)
```

#### 2. programs
```sql
- id (UUID, PK)
- school_id (UUID, FK)
- name (VARCHAR)
- duration (VARCHAR)
- description (TEXT)
- price (DECIMAL, optional)
- status (ENUM: active, inactive)
- display_order (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3. reviews
```sql
- id (UUID, PK)
- school_id (UUID, FK)
- user_name (VARCHAR)
- user_email (VARCHAR, optional)
- user_avatar (VARCHAR)
- rating (INTEGER)
- title (VARCHAR)
- content (TEXT)
- helpful_count (INTEGER)
- status (ENUM: pending, approved, rejected)
- admin_reply (TEXT, optional)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- moderated_at (TIMESTAMP)
- moderated_by (UUID, FK to admin_users)
```

#### 4. admin_users (already exists)
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- role (ENUM: admin, super_admin)
- created_at (TIMESTAMP)
```

#### 5. admin_activity_logs
```sql
- id (UUID, PK)
- admin_id (UUID, FK)
- action (VARCHAR)
- entity_type (VARCHAR)
- entity_id (UUID)
- changes (JSONB)
- ip_address (VARCHAR)
- created_at (TIMESTAMP)
```

## Implementation Priority

### Phase 1 (MVP)
1. Basic CRUD for flight schools
2. Program management
3. Simple review moderation
4. Basic authentication

### Phase 2
1. Image upload and management
2. Bulk operations
3. Advanced review features
4. Activity logging

### Phase 3
1. Analytics dashboard
2. Advanced search and filters
3. Email notifications
4. API for external integrations

## Security Considerations
- Role-based access control (admin vs super_admin)
- Audit logging for all admin actions
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting for API calls

## Performance Considerations
- Pagination for large datasets
- Image optimization and CDN
- Database indexing on frequently queried fields
- Caching strategy for read-heavy operations
- Lazy loading for images and reviews