-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create a simple index for faster lookup on users' username and email
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Insert initial data into the users table (example user data)
INSERT INTO users (username, name, email, password)
VALUES
    ('jdoe1', 'john doe','john.doe@example.com', 'hashedpassword'),
    ('jdoe2', 'jane doe','jane.doe@example.com', 'hashedpassword');

-- Insert initial courses data
INSERT INTO courses (title, description, user_id)
VALUES
    ('Intro to Node.js', 'Learn the basics of Node.js and Express.', 1),
    ('React for Beginners', 'Learn how to build user interfaces with React.', 2);

-- Optionally, create more advanced tables and logic for your app
