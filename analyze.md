# School Management Application - Code Analysis

## Overview
This is a school management web application built with Node.js/Express backend and plain HTML/CSS/JavaScript frontend, using MySQL for data storage.

## Backend Analysis (`server.js`)

### Architecture
- **Framework**: Express.js
- **Authentication**: Session-based using `express-session`
- **Password Security**: Bcrypt hashing (salt rounds: 10)
- **Database**: MySQL2 with connection pooling
- **Environment Variables**: Configurable DB connection and PORT

### Key Components

#### Middleware
1. `express.json()` - JSON body parsing
2. `express.urlencoded({ extended: true })` - URL-encoded form parsing
3. `express.static()` - Serves static files from `/public`
4. `express-session()` - Session management with 8-hour cookie expiry

#### Routes
1. **Authentication**
   - `POST /api/register` - User registration with validation
   - `POST /api/login` - User login with session creation
   - `POST /api/logout` - Session destruction
   - `GET /api/profile` - Protected route example (requires auth)

2. **Student CRUD** (all protected by `requireAuth` middleware)
   - `GET /api/students` - List all students
   - `POST /api/students` - Add new student
   - `PUT /api/students/:id` - Update student
   - `DELETE /api/students/:id` - Delete student

#### Validation
- Registration: Username (min 3 chars), Email (regex), Password (min 6 chars)
- Student fields: All required (name, roll, class, section)
- Duplicate prevention: Unique username/email, unique roll number

#### Security Features
- Password hashing with bcrypt
- Session-based authentication
- Parameterized queries to prevent SQL injection
- Generic error messages to prevent user enumeration
- Input validation and sanitization

#### Database Connection (`db.js`)
- Uses mysql2/promise for async/await compatibility
- Connection pooling (limit: 10)
- Configurable via environment variables:
  - DB_HOST (default: localhost)
  - DB_USER (default: root)
  - DB_PASSWORD (default: empty)
  - DB_NAME (default: school_db)

### Error Handling
- Try/catch blocks around async operations
- Consistent error response format: `{ errors: [...] }`
- 500 status for internal errors with generic messages
- Specific status codes for client errors (400, 401, 404, 409)

## Frontend Analysis (`public/` directory)

### Styling (`styles.css`)
- CSS Variables for consistent theming
- Modern, clean design with:
  - Primary color: #2563eb (blue)
  - Danger color: #dc2626 (red)
  - Success color: #16a34a (green)
  - Neutrals grayscale
- Responsive design with mobile breakpoint at 640px
- Card-based layout with subtle shadows
- Focus states and hover effects

### Pages

#### Login/Register (`login.html`)
- Tabbed interface for switching between login and register
- Form validation via JavaScript
- Error display areas
- Linked to `auth.js` for client-side logic

#### Dashboard (`dashboard.html`)
- Navigation bar with user display and logout button
- Two-card layout:
  1. Student form (add/edit)
  2. Student table with search functionality
- Empty state handling
- Hidden student ID field for edit operations

### JavaScript Components

#### Auth (`auth.js`)
- Handles form switching between login/register
- AJAX requests to authentication endpoints
- Session management via localStorage (token-based approach noted)
- Redirects on successful auth
- Error display handling

#### Dashboard (`dashboard.js`)
- Student CRUD operations via AJAX
- Form handling for add/edit
- Table rendering and updates
- Search functionality (client-side filtering)
- Cancel/edit state management
- Loading states and user feedback

## Database Schema (`schema.sql`)
- `users` table: id, username, email, password, created_at
- `students` table: id, name, roll, class, section, created_at
- Proper indexing and constraints
- Timestamps for record tracking

## Dependencies (`package.json`)
- express: ^4.19.2
- mysql2: ^3.11.0
- express-session: ^1.18.0
- bcrypt: ^5.1.1
- Scripts: start (node server.js), dev (node --watch server.js)

## Security Considerations
1. **Authentication**: Session-based with secure cookies
2. **Passwords**: Bcrypt hashing with salt
3. **SQL Injection**: Parameterized queries throughout
4. **Input Validation**: Both client and server-side
5. **Error Handling**: Generic messages to avoid information leakage
6. **Environment Variables**: Configurable database credentials

## Potential Improvements
1. Add rate limiting to auth endpoints
2. Implement refresh token mechanism for longer sessions
3. Add more comprehensive input sanitization
4. Implement role-based access control (admin/teacher/student)
5. Add API documentation (Swagger/OpenAPI)
6. Add unit and integration tests
7. Implement password reset functionality
8. Add more sophisticated search/filtering on backend
9. Add pagination for large datasets
10. Implement file uploads for student profiles/documents

## Deployment Notes
- Designed for XAMPP environment (MySQL + Apache)
- Can be deployed to any Node.js hosting with MySQL
- Environment variables for configuration
- Build process: npm install -> configure DB -> npm start