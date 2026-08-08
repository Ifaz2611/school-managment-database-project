const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./db'); // Ensure your db.js exports a mysql2/promise pool or similar

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'school-management-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 hours
  })
);

// Root route - send logged-in users to the dashboard, everyone else to login
app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard.html');
  }
  res.redirect('/login.html');
});

// Auth Middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(401).json({ error: 'You must be logged in.' });
  }
  res.redirect('/login.html');
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(body) {
  const { username, email, password } = body;
  const errors = [];
  if (!username || username.trim().length < 3) errors.push('Username must be at least 3 characters.');
  if (!email || !emailRegex.test(email)) errors.push('A valid email is required.');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');
  return errors;
}

// ==========================================
// ROUTES
// ==========================================

// 1. REGISTER
app.post('/api/register', async (req, res) => {
  const errors = validateRegister(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const username = req.body.username.trim();
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;

  try {
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existing.length) {
      return res.status(409).json({ errors: ['Username or email already taken.'] });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    // --- COMPLETED INSERT QUERY ---
    await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashed]
    );

    // Optional: Automatically log the user in after registration
    const [newUser] = await db.query('SELECT id, username, email FROM users WHERE email = ?', [email]);
    req.session.userId = newUser[0].id;
    req.session.username = newUser[0].username;

    res.status(201).json({ 
      message: 'Registration successful!', 
      user: { id: newUser[0].id, username: newUser[0].username, email: newUser[0].email } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ errors: ['An internal server error occurred.'] });
  }
});

// 2. LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ errors: ['Email and password are required.'] });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    
    if (users.length === 0) {
      // Generic message to prevent user enumeration
      return res.status(401).json({ errors: ['Invalid email or password.'] });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ errors: ['Invalid email or password.'] });
    }

    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({ 
      message: 'Login successful!', 
      user: { id: user.id, username: user.username, email: user.email } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ errors: ['An internal server error occurred.'] });
  }
});

// 3. LOGOUT
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Could not log out.' });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.json({ message: 'Logged out successfully.' });
  });
});

// 4. PROTECTED ROUTE EXAMPLE
app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email FROM users WHERE id = ?', [req.session.userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ errors: ['An internal server error occurred.'] });
  }
});

// ==========================================
// STUDENT CRUD
// ==========================================

// 1. LIST ALL STUDENTS
app.get('/api/students', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, roll, class, section FROM students ORDER BY id DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Fetch students error:', error);
    res.status(500).json({ errors: ['An internal server error occurred.'] });
  }
});

// 2. ADD STUDENT
app.post('/api/students', requireAuth, async (req, res) => {
  const { name, roll, class: className, section } = req.body;

  if (!name || !name.trim() || !roll || !roll.trim() || !className || !className.trim() || !section || !section.trim()) {
    return res.status(400).json({ errors: ['All fields are required.'] });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO students (name, roll, class, section) VALUES (?, ?, ?, ?)',
      [name.trim(), roll.trim(), className.trim(), section.trim()]
    );
    res.status(201).json({
      message: 'Student added successfully.',
      student: { id: result.insertId, name: name.trim(), roll: roll.trim(), class: className.trim(), section: section.trim() },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ errors: ['A student with this roll number already exists.'] });
    }
    console.error('Add student error:', error);
    res.status(500).json({ errors: ['An internal server error occurred.'] });
  }
});

// 3. UPDATE STUDENT
app.put('/api/students/:id', requireAuth, async (req, res) => {
  const { name, roll, class: className, section } = req.body;
  const id = req.params.id;

  if (!name || !name.trim() || !roll || !roll.trim() || !className || !className.trim() || !section || !section.trim()) {
    return res.status(400).json({ errors: ['All fields are required.'] });
  }

  try {
    const [result] = await db.query(
      'UPDATE students SET name = ?, roll = ?, class = ?, section = ? WHERE id = ?',
      [name.trim(), roll.trim(), className.trim(), section.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ errors: ['Student not found.'] });
    }

    res.json({
      message: 'Student updated successfully.',
      student: { id: Number(id), name: name.trim(), roll: roll.trim(), class: className.trim(), section: section.trim() },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ errors: ['A student with this roll number already exists.'] });
    }
    console.error('Update student error:', error);
    res.status(500).json({ errors: ['An internal server error occurred.'] });
  }
});

// 4. DELETE STUDENT
app.delete('/api/students/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ errors: ['Student not found.'] });
    }
    res.json({ message: 'Student deleted successfully.' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ errors: ['An internal server error occurred.'] });
  }
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});