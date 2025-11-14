# Design Document

## Overview

This design document outlines the architecture and implementation approach for enhancing the RSCI-RC3 platform with comprehensive admin management capabilities and professional user profile features. The enhancements include full CRUD operations for problems and users in the admin panel, interactive analytics visualizations, and rich user profiles with social media integration and profile picture uploads.

## Architecture

### System Components

1. **Admin Management Module**
   - Problem CRUD interface
   - User management interface
   - Analytics visualization dashboard

2. **User Profile Module**
   - Profile editing interface
   - Profile picture upload and storage
   - Social media links management
   - Public profile view

3. **File Storage Service**
   - Profile picture upload handling
   - Image optimization and resizing
   - Static file serving

4. **Analytics Service**
   - Data aggregation for charts
   - Time-series data processing
   - Export functionality

### Technology Stack

- **Frontend**: React with Chart.js/Recharts for visualizations
- **Backend**: Express.js with Prisma ORM
- **File Storage**: Local filesystem with Multer (can be upgraded to S3)
- **Image Processing**: Sharp library for image optimization
- **Charts**: Recharts for interactive data visualization

## Data Models

### Updated User Model

```prisma
model User {
  id                String              @id @default(uuid())
  username          String              @unique
  email             String              @unique
  passwordHash      String
  role              Role                @default(USER)
  
  // Profile fields
  fullName          String?
  bio               String?             @db.Text
  profilePicture    String?             // URL or path to image
  location          String?
  
  // Social media links
  linkedinUrl       String?
  githubUrl         String?
  twitterUrl        String?
  websiteUrl        String?
  
  // Statistics
  rating            Int                 @default(0)
  rank              Int                 @default(0)
  problemsSolved    Int                 @default(0)
  totalSubmissions  Int                 @default(0)
  acceptedSubmissions Int               @default(0)
  
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  submissions       Submission[]
  problemsCreated   Problem[]
  contestsCreated   Contest[]
  contestParticipants ContestParticipant[]
  
  @@index([username])
  @@index([email])
}
```

### Analytics Data Model (Virtual)

Analytics data will be computed on-demand from existing models:
- Daily/weekly/monthly submission trends
- Problem difficulty distribution
- Language usage statistics
- User activity metrics
- Acceptance rate trends

## Components and Interfaces

### Frontend Components

#### 1. Admin Problem Management (`/admin/problems`)

**Components:**
- `ProblemList`: Displays all problems with search and filter
- `ProblemForm`: Create/edit problem form with test cases
- `ProblemDeleteDialog`: Confirmation dialog for deletion
- `TestCaseManager`: Manage test cases for a problem

**Features:**
- Paginated problem list with search
- Inline editing capabilities
- Bulk test case upload (JSON format)
- Problem preview before publishing
- Difficulty and tag filtering

#### 2. Admin User Management (`/admin/users`)

**Components:**
- `UserList`: Paginated user list with search
- `UserEditDialog`: Modal for editing user details
- `UserDeleteDialog`: Confirmation with cascade warning
- `RoleSelector`: Dropdown for role assignment

**Features:**
- Search by username/email
- Filter by role and activity status
- View user statistics
- Role management
- Account suspension (soft delete option)

#### 3. Analytics Dashboard (`/admin/analytics`)

**Components:**
- `SubmissionTrendChart`: Line chart for submissions over time
- `DifficultyPieChart`: Pie chart for problem difficulty distribution
- `LanguageBarChart`: Bar chart for language popularity
- `ActiveUsersChart`: Line chart for daily active users
- `ExportButton`: Export analytics data to CSV

**Chart Library:** Recharts
- Interactive tooltips
- Responsive design
- Dark mode support
- Animation effects

#### 4. User Profile Page (`/profile/[username]`)

**Components:**
- `ProfileHeader`: Profile picture, name, bio, social links
- `ProfileStats`: Statistics cards (problems solved, rank, rating)
- `RecentSubmissions`: List of recent submissions
- `SocialLinks`: Social media icon buttons
- `ProfileEditButton`: Opens edit modal (own profile only)

#### 5. Profile Edit Modal (`/profile/edit`)

**Components:**
- `ProfileForm`: Form for editing profile information
- `ProfilePictureUpload`: Image upload with preview and crop
- `SocialLinksForm`: Input fields for social media URLs
- `SaveButton`: Submit profile changes

**Features:**
- Real-time preview
- Image cropping tool
- URL validation
- Character limits for bio
- Success/error notifications

### Backend API Endpoints

#### Admin Problem Management

```typescript
// Problem CRUD
POST   /api/admin/problems              // Create problem
GET    /api/admin/problems              // List all problems (paginated)
GET    /api/admin/problems/:id          // Get problem details
PUT    /api/admin/problems/:id          // Update problem
DELETE /api/admin/problems/:id          // Delete problem

// Test case management
POST   /api/admin/problems/:id/testcases     // Add test case
PUT    /api/admin/testcases/:id              // Update test case
DELETE /api/admin/testcases/:id              // Delete test case
POST   /api/admin/problems/:id/testcases/bulk // Bulk upload test cases
```

#### Admin User Management

```typescript
GET    /api/admin/users                 // List all users (paginated)
GET    /api/admin/users/:id             // Get user details
PUT    /api/admin/users/:id             // Update user (role, status)
DELETE /api/admin/users/:id             // Delete user
GET    /api/admin/users/search          // Search users
```

#### Analytics

```typescript
GET    /api/admin/analytics/submissions-trend    // Submission trend data
GET    /api/admin/analytics/difficulty-dist      // Difficulty distribution
GET    /api/admin/analytics/language-stats       // Language statistics
GET    /api/admin/analytics/active-users         // Active users over time
GET    /api/admin/analytics/export               // Export CSV
```

#### User Profile

```typescript
GET    /api/users/:username/profile     // Get public profile
PUT    /api/users/profile                // Update own profile
POST   /api/users/profile/picture       // Upload profile picture
DELETE /api/users/profile/picture       // Remove profile picture
PUT    /api/users/profile/social        // Update social links
```

### Service Layer

#### AdminService

```typescript
class AdminService {
  // Problem management
  async createProblem(data: CreateProblemDto): Promise<Problem>
  async updateProblem(id: string, data: UpdateProblemDto): Promise<Problem>
  async deleteProblem(id: string): Promise<void>
  async listProblems(filters: ProblemFilters): Promise<PaginatedProblems>
  
  // User management
  async listUsers(filters: UserFilters): Promise<PaginatedUsers>
  async updateUser(id: string, data: UpdateUserDto): Promise<User>
  async deleteUser(id: string): Promise<void>
  async searchUsers(query: string): Promise<User[]>
}
```

#### AnalyticsService

```typescript
class AnalyticsService {
  async getSubmissionTrend(days: number): Promise<TrendData[]>
  async getDifficultyDistribution(): Promise<DistributionData[]>
  async getLanguageStats(): Promise<LanguageData[]>
  async getActiveUsers(days: number): Promise<ActiveUserData[]>
  async exportAnalytics(format: 'csv' | 'json'): Promise<Buffer>
}
```

#### ProfileService

```typescript
class ProfileService {
  async getProfile(username: string): Promise<UserProfile>
  async updateProfile(userId: string, data: UpdateProfileDto): Promise<User>
  async uploadProfilePicture(userId: string, file: File): Promise<string>
  async deleteProfilePicture(userId: string): Promise<void>
  async updateSocialLinks(userId: string, links: SocialLinks): Promise<User>
}
```

#### FileStorageService

```typescript
class FileStorageService {
  async uploadImage(file: Buffer, userId: string): Promise<string>
  async deleteImage(path: string): Promise<void>
  async optimizeImage(buffer: Buffer): Promise<Buffer>
  async resizeImage(buffer: Buffer, width: number, height: number): Promise<Buffer>
}
```

## File Upload Strategy

### Profile Picture Upload Flow

1. **Client Side:**
   - User selects image file
   - Client validates file type and size
   - Preview shown with crop tool
   - User confirms and uploads

2. **Server Side:**
   - Multer middleware receives file
   - Validate file type (JPEG, PNG, WebP)
   - Validate file size (max 5MB)
   - Use Sharp to resize to 400x400px
   - Optimize image quality
   - Generate unique filename
   - Save to `/uploads/profiles/` directory
   - Return URL path

3. **Storage Structure:**
```
/uploads
  /profiles
    /{userId}-{timestamp}.jpg
```

4. **Database:**
   - Store relative path in `profilePicture` field
   - Serve via static file middleware

### Future Enhancement: S3 Integration

For production, consider AWS S3:
- Use `aws-sdk` or `@aws-sdk/client-s3`
- Upload to S3 bucket
- Store S3 URL in database
- Use CloudFront for CDN

## Analytics Visualization Design

### Chart Specifications

#### 1. Submission Trend Chart (Line Chart)
- **X-Axis:** Date (last 30 days)
- **Y-Axis:** Number of submissions
- **Lines:** Total submissions, Accepted submissions
- **Colors:** Blue for total, Green for accepted
- **Tooltip:** Date, count, percentage

#### 2. Difficulty Distribution (Pie Chart)
- **Segments:** Easy, Medium, Hard
- **Colors:** Green (Easy), Yellow (Medium), Red (Hard)
- **Labels:** Percentage and count
- **Interactive:** Click to filter problems

#### 3. Language Statistics (Bar Chart)
- **X-Axis:** Programming languages
- **Y-Axis:** Number of submissions
- **Colors:** Gradient based on popularity
- **Tooltip:** Language name, count, percentage

#### 4. Active Users (Line Chart)
- **X-Axis:** Date (last 30 days)
- **Y-Axis:** Number of active users
- **Line:** Daily active users
- **Color:** Purple gradient
- **Tooltip:** Date, user count

### Chart Library Configuration

Using **Recharts** for all visualizations:

```typescript
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
```

**Benefits:**
- React-native components
- Responsive by default
- Excellent TypeScript support
- Customizable themes
- Animation support

## Error Handling

### Admin Operations

1. **Problem Deletion:**
   - Check for active submissions
   - Warn about cascade deletion
   - Require confirmation
   - Log deletion for audit

2. **User Deletion:**
   - Check for admin role (prevent deleting last admin)
   - Warn about data loss
   - Cascade delete submissions
   - Log deletion for audit

3. **Validation Errors:**
   - Display field-specific errors
   - Highlight invalid fields
   - Provide helpful error messages

### File Upload Errors

1. **Invalid File Type:**
   - Show error: "Please upload a JPEG, PNG, or WebP image"
   - Clear file input

2. **File Too Large:**
   - Show error: "Image must be less than 5MB"
   - Suggest compression

3. **Upload Failed:**
   - Show error: "Upload failed. Please try again"
   - Retry button

4. **Processing Failed:**
   - Show error: "Image processing failed"
   - Fallback to original image

## Security Considerations

### Admin Access Control

1. **Middleware Protection:**
   - Verify JWT token
   - Check user role === 'ADMIN'
   - Return 403 for unauthorized access

2. **Frontend Protection:**
   - Hide admin routes from non-admins
   - Redirect unauthorized users
   - Show 404 for admin pages to non-admins

### File Upload Security

1. **File Type Validation:**
   - Check MIME type on server
   - Verify file extension
   - Use magic number validation

2. **File Size Limits:**
   - Enforce 5MB limit
   - Use Multer limits configuration

3. **File Storage:**
   - Generate unique filenames
   - Store outside web root
   - Serve via controlled endpoint

4. **Image Processing:**
   - Strip EXIF data
   - Re-encode images
   - Prevent malicious payloads

### Input Validation

1. **URL Validation:**
   - Validate social media URLs
   - Check URL format
   - Prevent XSS in URLs

2. **Text Input Sanitization:**
   - Sanitize bio and name fields
   - Prevent HTML injection
   - Limit character counts

## Testing Strategy

### Unit Tests

1. **Service Layer:**
   - Test CRUD operations
   - Test analytics calculations
   - Test file upload logic
   - Mock database calls

2. **Validation:**
   - Test input validation
   - Test URL validation
   - Test file type validation

### Integration Tests

1. **API Endpoints:**
   - Test admin problem CRUD
   - Test user management
   - Test profile updates
   - Test file uploads

2. **Authentication:**
   - Test admin-only access
   - Test unauthorized access
   - Test token validation

### E2E Tests

1. **Admin Workflows:**
   - Create and publish problem
   - Edit existing problem
   - Delete problem with confirmation
   - Manage user roles

2. **User Profile:**
   - Update profile information
   - Upload profile picture
   - Add social media links
   - View public profile

## Performance Considerations

### Database Optimization

1. **Indexes:**
   - Add index on `User.fullName` for search
   - Add index on `User.profilePicture` for filtering
   - Composite index on `Submission(userId, submittedAt)`

2. **Query Optimization:**
   - Use pagination for large lists
   - Limit joined data
   - Cache analytics queries

### Image Optimization

1. **Compression:**
   - Use Sharp with quality: 85
   - Convert to WebP for modern browsers
   - Fallback to JPEG for compatibility

2. **Caching:**
   - Set cache headers for profile pictures
   - Use CDN for static assets
   - Implement browser caching

### Analytics Performance

1. **Data Aggregation:**
   - Pre-compute daily statistics
   - Cache analytics results (5 minutes)
   - Use database aggregation functions

2. **Chart Rendering:**
   - Lazy load charts
   - Debounce filter changes
   - Use virtualization for large datasets

## UI/UX Design

### Admin Panel Design

- **Layout:** Sidebar navigation with main content area
- **Theme:** Consistent with existing dark/light mode
- **Colors:** Use existing primary colors with admin-specific accents
- **Icons:** Use Heroicons for consistency
- **Feedback:** Toast notifications for actions

### Profile Page Design

- **Layout:** Header with profile info, tabs for different sections
- **Profile Picture:** Large circular avatar (200px)
- **Social Icons:** Colorful brand icons (LinkedIn blue, GitHub black, etc.)
- **Stats:** Card-based layout with icons
- **Responsive:** Mobile-first design

### Form Design

- **Validation:** Real-time validation with error messages
- **Loading States:** Skeleton loaders and spinners
- **Success States:** Green checkmarks and success messages
- **Accessibility:** Proper labels, ARIA attributes, keyboard navigation

## Migration Plan

### Database Migration

```prisma
// Migration: add_user_profile_fields
- Add fullName, bio, location fields
- Add profilePicture field
- Add social media URL fields
- Add acceptedSubmissions field
- Create indexes
```

### Data Migration

1. **Existing Users:**
   - Set default values for new fields
   - Generate placeholder profile pictures (initials)
   - Calculate acceptedSubmissions from existing data

2. **Backward Compatibility:**
   - Make all new fields optional
   - Provide defaults in queries
   - Handle null values gracefully

## Deployment Considerations

### Environment Variables

```env
# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Analytics
ANALYTICS_CACHE_TTL=300  # 5 minutes

# S3 (Optional)
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
```

### File Storage Setup

1. **Local Development:**
   - Create `/uploads/profiles` directory
   - Set proper permissions
   - Add to `.gitignore`

2. **Production:**
   - Use S3 or similar object storage
   - Configure CDN
   - Set up backup strategy

### Monitoring

1. **Metrics to Track:**
   - File upload success/failure rate
   - Average image processing time
   - Analytics query performance
   - Admin action audit log

2. **Alerts:**
   - Failed file uploads
   - Slow analytics queries
   - Unauthorized admin access attempts
