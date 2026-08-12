# School Management Web Application

A complete school management system with user authentication and student records management. Built with Node.js + Express backend, plain HTML/CSS/JavaScript frontend, and MySQL database.

## Features

### User Authentication
- Secure user registration with email verification
- Login/logout functionality with session management
- Password protection using bcrypt hashing
- Protected routes requiring authentication

### Student Management
- Add new students with validation
- View all students in a searchable table
- Edit existing student information
- Delete student records
- Roll number uniqueness enforcement

### Frontend
- Clean, responsive UI with modern CSS
- Tabbed authentication interface
- Dashboard with student form and data table
- Real-time form validation
- Search and filter capabilities
- Loading states and user feedback

### Backend
- RESTful API design
- Input validation and sanitization
- Parameterized queries to prevent SQL injection
- Error handling with appropriate HTTP status codes
- Environment-based configuration
- Session-based authentication

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL2** - Database driver
- **Express-session** - Session management
- **Bcrypt** - Password hashing
- **dotenv** - Environment variable management

### Frontend
- **HTML5** - Markup structure
- **CSS3** - Styling with CSS variables
- **Vanilla JavaScript** - Client-side logic
- **Responsive Design** - Mobile-friendly interface

### Database
- **MySQL** - Relational database
- **phpMyAdmin** - Database management (via XAMPP)

## Prerequisites

1. **XAMPP** - For Apache and MySQL services
   - Download from: https://www.apachefriends.org/
2. **Node.js** (v18 or newer)
   - Download from: https://nodejs.org/
3. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/



```

Quick Start (Easy Instructions)
Follow these simple steps to run the project on your computer:

1. Start XAMPP
Open XAMPP Control Panel

Click Start for Apache and MySQL

Make sure both show Running in green

2. Create the Database
Go to http://localhost/phpmyadmin (localhost in Bing) in your browser

Click Import

Select the file schema.sql from this project

Click Go → This will create the database school_db with tables

3. Install Node.js Packages
Open Command Prompt / Terminal

Go to the project folder (e.g., cd School-pro)

Run:

bash
npm install
4. Start the Server
Run:

bash
npm start
If successful, you’ll see:

Code
Server is running on http://localhost:3000
5. Open the Website
In your browser, go to: http://localhost:3000

Click Sign Up to create an account

Log in with your email and password

Use the dashboard to add, edit, or delete student records
```

## Setup Instructions

### Step 1 – Start XAMPP Services
1. Open the **XAMPP Control Panel**
2. Click **Start** next to **Apache**
3. Click **Start** next to **MySQL**
4. Both should show a green "Running" status

### Step 2 – Create the Database
1. Open your browser and go to **http://localhost/phpmyadmin**
2. Click the **Import** tab at the top
3. Click **Choose File** and select the `schema.sql` file from this project
4. Click **Go** at the bottom
   - This creates the `school_db` database with `users` and `students` tables

> **Alternative**: Using MySQL command line:
> ```bash
> mysql -u root < schema.sql
> ```

### Step 3 – Install Dependencies
Open a terminal (Command Prompt / PowerShell / Git Bash) in this project folder and run:
```bash
npm install
```
This installs Express, MySQL2, express-session, and bcrypt.

### Step 4 – Configure Database Connection (if needed)
The app uses XAMPP's default MySQL settings:
- Host: `localhost`
- User: `root`
- Password: *(empty)*
- Database: `school_db`

To customize, set environment variables before starting:
- `DB_HOST` - Database host (default: localhost)
- `DB_USER` - Database username (default: root)
- `DB_PASSWORD` - Database password (default: empty)
- `DB_NAME` - Database name (default: school_db)
- `PORT` - Server port (default: 3000)

**Windows (Command Prompt):**
```bash
set DB_PASSWORD=yourpassword
npm start
```

**Mac / Linux / Git Bash:**
```bash
DB_PASSWORD=yourpassword npm start
```

### Step 5 – Run the Application
```bash
npm start
```
You should see:
```
Server is running on http://localhost:3000
```

For development with auto-restart:
```bash
npm run dev
```

### Step 6 – Open in Browser
Navigate to **http://localhost:3000**

1. Click **Sign Up** to create an account (username, email, password)
2. Log in with your email and password
3. Manage student records through the dashboard

## Project Structure
```
School-pro/
├── public/                 # Static frontend files
│   ├── auth.js             # Authentication logic
│   ├── dashboard.js        # Dashboard/student management logic
│   ├── dashboard.html      # Main dashboard page
│   ├── login.html          # Login/registration page
│   └── styles.css          # Stylesheet
├── db.js                   # Database connection pool
├── schema.sql              # Database schema
├── server.js               # Main Express server
├── package.json            # Project dependencies and scripts
�└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/profile` - Get authenticated user profile

### Student Management
- `GET /api/students` - Get all students (auth required)
- `POST /api/students` - Create new student (auth required)
- `PUT /api/students/:id` - Update student (auth required)
- `DELETE /api/students/:id` - Delete student (auth required)

## Security Features
- Passwords hashed with bcrypt (salt rounds: 10)
- Session-based authentication with HTTP-only cookies
- Parameterized queries to prevent SQL injection
- Input validation on both client and server sides
- Generic error messages to prevent information leakage
- Protected routes requiring authentication

## Environment Variables
Create a `.env` file in the root directory (optional):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=school_db
PORT=3000
SECRET_KEY=your_secret_key_here
```

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is open source and available under the MIT License.

## Acknowledgments
- Built with Node.js and Express
- Styled with modern CSS techniques
- Database powered by MySQL via XAMPP
- Inspired by common school management system requirements

---
**Note**: For production use, consider:
- Using HTTPS in production
- Implementing rate limiting on auth endpoints
- Adding more comprehensive logging
- Using a production-grade process manager (PM2)
- Regular dependency updates and security audits