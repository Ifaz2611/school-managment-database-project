# School Management Web Application


A simple school management app with user authentication (register/login) and student records management (add, view, edit, delete). Built with **Node.js + Express** on the backend, **plain HTML/CSS/JavaScript** on the frontend, and **MySQL** (via XAMPP) for storage.


## Prerequisites


1. **XAMPP** – download from https://www.apachefriends.org/
2. **Node.js** (v18 or newer) – download from https://nodejs.org/


## Setup Instructions


### Step 1 – Start XAMPP and MySQL


1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **Apache**.
3. Click **Start** next to **MySQL**.
   Both should show a green "Running" status.


### Step 2 – Create the Database


1. Open your browser and go to **http://localhost/phpmyadmin**.
2. Click the **Import** tab at the top.
3. Click **Choose File** and select the `schema.sql` file from this project folder.
4. Click **Go** at the bottom.
   This creates the `school_db` database with the `users` and `students` tables.


> Alternatively, open the MySQL command line and run:
> ```
> mysql -u root < schema.sql
> ```


### Step 3 – Install Project Dependencies


Open a terminal (Command Prompt / PowerShell / Git Bash) in this project folder and run:


```
npm install
```


This installs Express, MySQL2, express-session, and bcrypt.


### Step 4 – Configure Database Connection (if needed)


The app defaults to XAMPP's standard MySQL settings:
- Host: `localhost`
- User: `root`
- Password: *(empty)*
- Database: `school_db`


If your MySQL setup uses a different password or database name, set these environment variables before starting the server:


**Windows (Command Prompt):**
```
set DB_PASSWORD=yourpassword
npm start
```


**Mac / Linux / Git Bash:**
```
DB_PASSWORD=yourpassword npm start
```


Supported environment variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`.


### Step 5 – Run the Application


```
npm start
```


You should see:
```
School Management app running at http://localhost:3000
```


### Step 6 – Open in Browser


Go to **http://localhost:3000**


1. Click **Sign Up** and create an account (username, email, password).
2. Log in with your email and password.