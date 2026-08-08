-- School Management Database Schema
-- Import this file via phpMyAdmin (XAMPP) or run it in the MySQL command line.


CREATE DATABASE IF NOT EXISTS school_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;


USE school_db;


-- User accounts (registered users who can log in)
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Student records
CREATE TABLE IF NOT EXISTS students (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  roll        VARCHAR(20)  NOT NULL,
  class       VARCHAR(50)  NOT NULL,
  section     VARCHAR(10)  NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_roll (roll)
);


-- Optional sample data (uncomment to seed)
-- INSERT INTO students (name, roll, class, section) VALUES
--   ('Alice Johnson', '101', '10', 'A'),
--   ('Bob Smith', '102', '10', 'B'),
--   ('Charlie Brown', '103', '9', 'A');

