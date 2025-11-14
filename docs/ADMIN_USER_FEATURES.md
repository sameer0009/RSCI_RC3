# Admin & User Profile Features - Complete Guide

## 🎉 NEW FEATURES IMPLEMENTED

### 1. User Profile Management
Users can now create rich, professional profiles with:
- **Profile Pictures** - Upload and display custom avatars
- **Personal Information** - Full name, bio, location
- **Social Media Links** - LinkedIn, GitHub, Twitter, Website
- **Statistics Display** - Problems solved, rating, rank
- **Recent Activity** - View recent accepted submissions

### 2. Admin Problem Management
Admins can fully manage the problem database:
- **Create Problems** - Add new coding problems with test cases
- **Edit Problems** - Update existing problem details
- **Delete Problems** - Remove problems (with cascade deletion warning)
- **Search & Filter** - Find problems by title, difficulty, or tags
- **Bulk Test Cases** - Upload multiple test cases at once

### 3. Admin User Management
Admins have complete control over user accounts:
- **View All Users** - Paginated list with search functionality
- **Edit Users** - Update user details and roles
- **Role Management** - Promote users to admin or demote to user
- **Delete Users** - Remove user accounts (with safeguards)
- **Search Users** - Find users by username, email, or name

### 4. Analytics Dashboard
Comprehensive platform insights with interactive charts:
- **Submission Trends** - Line chart showing submissions over time
- **Difficulty Distribution** - Pie chart of problem difficulties
- **Language Statistics** - Bar chart of popular programming languages
- **Active Users** - Track daily active user counts
- **CSV Export** - Download analytics data for external analysis

## 📍 HOW TO ACCESS

### User Profile Features
1. **View Your Profile**: Click your username in the navbar → "Profile"
2. **Edit Profile**: Visit your profile page → Click "Edit Profile"
3. **Upload Picture**: Click the camera icon on your profile picture
4. **Add Social Links**: In edit profile modal, add your social media URLs
5. **View Others**: Click any username on leaderboard or submissions

### Admin Features
1. **Access Admin Dashboard**: Navigate to `/admin` (admin users only)
2. **Manage Problems**: Click "Problems" card or visit `/admin/problems`
3. **Manage Users**: Click "Users" card or visit `/admin/users`
4. **View Analytics**: Click "Analytics" card or visit `/admin/analytics`

## 🔐 PERMISSIONS

### Regular Users Can:
- ✅ View and edit their own profile
- ✅ Upload profile pictures
- ✅ Add social media links
- ✅ View other users' public profiles
- ✅ Browse problems and submit solutions

### Admin Users Can:
- ✅ Everything regular users can do, PLUS:
- ✅ Create, edit, and delete problems
- ✅ Manage test cases for problems
- ✅ View and edit all user accounts
- ✅ Change user roles (promote/demote)
- ✅ Delete user accounts (except last admin)
- ✅ Access analytics dashboard
- ✅ Export platform data

## 🎨 UI FEATURES

### Profile Pages
- **Modern Design** - Glass-morphism effects and gradients
- **Responsive Layout** - Works on mobile, tablet, and desktop
- **Dark Mode Support** - Seamless dark/light theme switching
- **Social Icons** - Branded icons for each social platform
- **Rank Badges** - Visual indicators for top performers (🥇🥈🥉🏆)

### Admin Pages
- **Data Tables** - Sortable, searchable tables with pagination
- **Confirmation Dialogs** - Prevent accidental deletions
- **Real-time Search** - Instant filtering as you type
- **Status Indicators** - Color-coded badges for roles and difficulty
- **Quick Actions** - Edit and delete buttons on each row

### Analytics Dashboard
- **Interactive Charts** - Hover for detailed tooltips
- **Date Range Selector** - View data for 7, 30, or 90 days
- **Responsive Charts** - Automatically resize for screen size
- **Export Function** - Download data as CSV file
- **Dark Mode Charts** - Charts adapt to theme

## 🔧 TECHNICAL DETAILS

### API Endpoints

#### Profile Management
```
GET    /api/users/:username/profile     - Get public profile
PUT    /api/users/profile                - Update own profile
POST   /api/users/profile/picture       - Upload profile picture
DELETE /api/users/profile/picture       - Remove profile picture
PUT    /api/users/profile/social        - Update social links
```

#### Admin Problem Management
```
POST   /api/admin/problems                      - Create problem
GET    /api/admin/problems                      - List problems
GET    /api/admin/problems/:id                  - Get problem
PUT    /api/admin/problems/:id                  - Update problem
DELETE /api/admin/problems/:id                  - Delete problem
POST   /api/admin/problems/:id/testcases/bulk  - Bulk upload test cases
```

#### Admin User Management
```
GET    /api/admin/users           - List users
GET    /api/admin/users/:id       - Get user details
PUT    /api/admin/users/:id       - Update user
DELETE /api/admin/users/:id       - Delete user
GET    /api/admin/users/search    - Search users
```

#### Analytics
```
GET /api/admin/analytics/submissions-trend  - Submission trend data
GET /api/admin/analytics/difficulty-dist    - Difficulty distribution
GET /api/admin/analytics/language-stats     - Language statistics
GET /api/admin/analytics/active-users       - Active users data
GET /api/admin/analytics/export             - Export CSV
```

### Database Schema Updates
```prisma
model User {
  // New profile fields
  fullName          String?
  bio               String?
  profilePicture    String?
  location          String?
  
  // Social media links
  linkedinUrl       String?
  githubUrl         String?
  twitterUrl        String?
  websiteUrl        String?
  
  // Enhanced statistics
  acceptedSubmissions Int @default(0)
}
```

### File Upload Configuration
- **Max File Size**: 5MB
- **Allowed Formats**: JPEG, PNG, WebP
- **Image Processing**: Automatic resize to 400x400px
- **Quality**: 85% JPEG compression
- **Storage**: Local filesystem at `/uploads/profiles/`

## 📝 USAGE EXAMPLES

### Example 1: Creating a Profile
1. Log in to your account
2. Click your username → "Profile"
3. Click "Edit Profile"
4. Fill in your information:
   - Full Name: "John Doe"
   - Bio: "Full-stack developer passionate about algorithms"
   - Location: "San Francisco, CA"
   - LinkedIn: "https://linkedin.com/in/johndoe"
   - GitHub: "https://github.com/johndoe"
5. Click "Save Changes"
6. Upload a profile picture by clicking the camera icon

### Example 2: Admin Creating a Problem
1. Navigate to `/admin/problems`
2. Click "+ Create Problem"
3. Fill in problem details:
   - Title: "Two Sum"
   - Difficulty: "Easy"
   - Description: Problem statement
   - Input/Output format
   - Constraints
4. Add test cases
5. Click "Create Problem"

### Example 3: Viewing Analytics
1. Navigate to `/admin/analytics`
2. Select date range (7, 30, or 90 days)
3. View interactive charts:
   - Hover over data points for details
   - Scroll to see all charts
4. Click "Export CSV" to download data

## 🐛 TROUBLESHOOTING

### Profile Picture Won't Upload
- **Check file size**: Must be under 5MB
- **Check format**: Only JPEG, PNG, WebP allowed
- **Check permissions**: Ensure you're logged in
- **Check network**: Verify backend is running

### Can't Access Admin Pages
- **Check role**: Only admin users can access
- **Check login**: Ensure you're authenticated
- **Check URL**: Admin pages are at `/admin/*`

### Charts Not Loading
- **Check data**: Ensure there's data in the database
- **Check console**: Look for JavaScript errors
- **Refresh page**: Try reloading the page
- **Check backend**: Verify analytics endpoints are working

## 🚀 FUTURE ENHANCEMENTS

Potential features for future development:
- Profile badges and achievements
- User activity timeline
- Advanced analytics filters
- Bulk user operations
- Problem difficulty calculator
- Automated problem testing
- User reputation system
- Profile customization themes

## 📞 SUPPORT

For issues or questions:
1. Check this documentation
2. Review the API documentation
3. Check browser console for errors
4. Verify backend logs
5. Ensure database is up to date

## 🎓 BEST PRACTICES

### For Users
- Use a professional profile picture
- Write a concise, informative bio
- Keep social links up to date
- Maintain an active profile

### For Admins
- Always confirm before deleting
- Regularly review user accounts
- Monitor analytics for trends
- Keep problem database organized
- Back up data regularly

---

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Platform**: RSCI-RC3 Online Coding Platform
