# Implementation Plan

- [x] 1. Update database schema and setup file storage




- [ ] 1.1 Update Prisma schema with user profile fields (fullName, bio, profilePicture, location, social links, acceptedSubmissions)
  - Add new fields to User model
  - Create database migration


  - _Requirements: 4.1, 5.1, 6.1_

- [ ] 1.2 Setup file upload infrastructure
  - Install multer and sharp packages


  - Create uploads directory structure
  - Configure multer middleware for image uploads
  - _Requirements: 6.2, 6.3_





- [ ] 1.3 Create FileStorageService for image handling
  - Implement image upload method
  - Implement image optimization with Sharp (resize to 400x400, quality 85)
  - Implement image deletion method
  - Add file type and size validation
  - _Requirements: 6.2, 6.3, 6.4_



- [ ] 2. Implement backend services and API endpoints
- [ ] 2.1 Create ProfileService for user profile management
  - Implement getProfile method to fetch user profile data
  - Implement updateProfile method with validation
  - Implement uploadProfilePicture method


  - Implement deleteProfilePicture method
  - Implement updateSocialLinks method with URL validation
  - _Requirements: 4.2, 4.3, 5.2, 5.3, 6.4_

- [ ] 2.2 Create profile API routes and controllers
  - GET /api/users/:username/profile - Get public profile


  - PUT /api/users/profile - Update own profile
  - POST /api/users/profile/picture - Upload profile picture
  - DELETE /api/users/profile/picture - Remove profile picture
  - PUT /api/users/profile/social - Update social links
  - _Requirements: 4.4, 5.4, 6.5_




- [ ] 2.3 Extend AnalyticsService with chart data methods
  - Implement getSubmissionTrend for line chart data
  - Implement getDifficultyDistribution for pie chart
  - Implement getLanguageStats for bar chart
  - Implement getActiveUsers for activity chart
  - Add caching for analytics queries (5 min TTL)


  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 2.4 Create analytics API routes for chart data
  - GET /api/admin/analytics/submissions-trend
  - GET /api/admin/analytics/difficulty-dist
  - GET /api/admin/analytics/language-stats
  - GET /api/admin/analytics/active-users



  - GET /api/admin/analytics/export (CSV export)
  - _Requirements: 3.5, 3.6_


- [ ] 3. Implement admin problem management
- [ ] 3.1 Create AdminService for problem CRUD operations
  - Implement createProblem method with validation
  - Implement updateProblem method
  - Implement deleteProblem method with cascade handling
  - Implement listProblems with pagination and filters
  - Implement bulk test case upload
  - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [ ] 3.2 Create admin problem API routes and controllers
  - POST /api/admin/problems - Create problem
  - GET /api/admin/problems - List problems (paginated)
  - GET /api/admin/problems/:id - Get problem details
  - PUT /api/admin/problems/:id - Update problem
  - DELETE /api/admin/problems/:id - Delete problem
  - POST /api/admin/problems/:id/testcases/bulk - Bulk upload test cases
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

- [x] 3.3 Build admin problem management UI page



  - Create ProblemList component with search and filters
  - Create ProblemForm component for create/edit
  - Create ProblemDeleteDialog with confirmation
  - Create TestCaseManager component
  - Add pagination controls
  - Implement problem preview
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_






- [ ] 4. Implement admin user management
- [ ] 4.1 Extend AdminService with user management methods
  - Implement listUsers with pagination and search
  - Implement updateUser method (role, status)
  - Implement deleteUser with cascade handling
  - Implement searchUsers method
  - Add validation to prevent deleting last admin

  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4.2 Create admin user API routes and controllers
  - GET /api/admin/users - List users (paginated)
  - GET /api/admin/users/:id - Get user details
  - PUT /api/admin/users/:id - Update user
  - DELETE /api/admin/users/:id - Delete user


  - GET /api/admin/users/search - Search users
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_




- [ ] 4.3 Build admin user management UI page
  - Create UserList component with search
  - Create UserEditDialog modal



  - Create UserDeleteDialog with cascade warning
  - Create RoleSelector component
  - Add filter by role and activity
  - Display user statistics in list
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_



- [ ] 5. Build analytics dashboard with visualizations
- [ ] 5.1 Install and configure Recharts library
  - Add recharts package to frontend
  - Create chart theme configuration for dark/light mode
  - Create reusable chart wrapper components
  - _Requirements: 3.1, 3.2, 3.3, 3.4_


- [ ] 5.2 Create analytics chart components
  - Create SubmissionTrendChart (line chart)
  - Create DifficultyPieChart (pie chart)
  - Create LanguageBarChart (bar chart)
  - Create ActiveUsersChart (line chart)
  - Add interactive tooltips and legends




  - Implement responsive design
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5.3 Build analytics dashboard page
  - Create analytics layout with chart grid
  - Integrate all chart components
  - Add date range selector

  - Create ExportButton for CSV download
  - Add loading states for charts
  - Implement error handling
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 6. Implement user profile features
- [ ] 6.1 Create profile edit modal component
  - Create ProfileForm with all fields (fullName, bio, location)


  - Create ProfilePictureUpload with preview
  - Create SocialLinksForm with URL validation
  - Add character limits and validation
  - Implement real-time preview
  - Add save/cancel buttons



  - _Requirements: 4.2, 4.3, 5.1, 5.2, 6.1, 6.2, 6.3_

- [ ] 6.2 Build public profile page
  - Create ProfileHeader with picture, name, bio
  - Create ProfileStats cards (problems solved, rank, rating)
  - Create SocialLinks component with icons

  - Create RecentSubmissions list
  - Add rank badge display
  - Implement responsive layout
  - _Requirements: 4.1, 4.5, 4.6, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 6.3 Integrate profile features into existing pages


  - Add profile picture to Navbar
  - Add profile link to user dropdown
  - Make usernames clickable to profile pages
  - Update leaderboard to show profile pictures

  - Add "Edit Profile" button on own profile
  - _Requirements: 4.1, 5.5, 7.1_

- [ ] 7. Add admin navigation and integrate all features
- [ ] 7.1 Update admin dashboard with new navigation
  - Add sidebar navigation for admin sections


  - Add links to Problems, Users, Analytics pages
  - Update existing dashboard to show overview
  - Add breadcrumb navigation
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 7.2 Update middleware and route protection
  - Ensure all admin routes require admin role
  - Add file upload size limits to middleware
  - Add rate limiting for file uploads
  - Update error handling for new endpoints
  - _Requirements: 1.1, 2.1, 6.2_

- [ ] 7.3 Update database seed with profile data
  - Add sample profile pictures for seed users
  - Add sample bios and social links
  - Calculate acceptedSubmissions for existing users
  - _Requirements: 4.1, 5.1, 6.1_

- [ ] 7.4 Add validation and error handling tests
  - Test profile picture upload validation
  - Test social URL validation
  - Test admin permission checks
  - Test cascade deletion warnings
  - _Requirements: 1.6, 2.6, 6.2_

- [ ] 7.5 Create documentation for new features
  - Document admin problem management workflow
  - Document user management procedures
  - Document profile picture upload process
  - Add API documentation for new endpoints
  - _Requirements: 1.1, 2.1, 4.1, 5.1_
