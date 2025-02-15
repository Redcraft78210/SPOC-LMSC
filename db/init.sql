-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    "rôle" VARCHAR(32) NULL,
    password VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id UUID NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Trigger to auto-update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the users table
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Attach the trigger to the courses table
CREATE TRIGGER trigger_courses_updated_at
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a simple index for faster lookup on users' username and email
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Insert initial data into the users table (example user data)
INSERT INTO users (id, username, name, email, "rôle", password)
VALUES
    ('a6fa5fc1-1234-4321-0000-000000000001','jdoe1', 'john doe','john.doe@example.com', 'Professeur', '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'),
    ('a6fa5fc1-1234-4321-0000-000000000002','jdoe2', 'jane doe','jane.doe@example.com', '','$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2');

-- Insert initial courses data
-- Assuming you know the UUIDs of the users, use them here:
INSERT INTO courses (title, description, user_id)
VALUES
    ('Intro to Node.js', 'Learn the basics of Node.js and Express.', 'a6fa5fc1-1234-4321-0000-000000000001'),
    ('React for Beginners', 'Learn how to build user interfaces with React.', 'a6fa5fc1-1234-4321-0000-000000000002');


-- Optionally, create more advanced tables and logic for your app
