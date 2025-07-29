-- init.sql

-- 1) Create & select the database
CREATE DATABASE IF NOT EXISTS defaultdb;
USE defaultdb;

-- 2) Users table
CREATE TABLE IF NOT EXISTS users (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  username         VARCHAR(50)  UNIQUE NOT NULL,
  email            VARCHAR(100) UNIQUE NOT NULL,
  password         VARCHAR(255) NOT NULL,
  bio              TEXT,
  profile_picture  VARCHAR(255),
  created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3) Categories table
CREATE TABLE IF NOT EXISTS categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4) Tags table
CREATE TABLE IF NOT EXISTS tags (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50) UNIQUE NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- 5) Posts table (with image, category, timestamps)
CREATE TABLE IF NOT EXISTS posts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT          NOT NULL,
  category_id  INT          NOT NULL,
  title        VARCHAR(255) NOT NULL,
  content      TEXT,
  image_url    VARCHAR(255),
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)  ON DELETE CASCADE
);

-- 6) Post-Tags join table
CREATE TABLE IF NOT EXISTS post_tags (
  post_id   INT NOT NULL,
  tag_id    INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id)    REFERENCES posts(id)    ON DELETE CASCADE,
  FOREIGN KEY (tag_id)     REFERENCES tags(id)     ON DELETE CASCADE
);
