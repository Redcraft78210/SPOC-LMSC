CREATE TYPE statut_type AS ENUM ('actif', 'inactif');

-- Create administrateurs table
CREATE TABLE
    IF NOT EXISTS administrateurs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        statut statut_type DEFAULT 'actif',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create students table
CREATE TABLE
    IF NOT EXISTS students (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        statut statut_type DEFAULT 'actif',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create teachers table
CREATE TABLE
    IF NOT EXISTS teachers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create classes table
CREATE TABLE
    classes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        name VARCHAR(255) NOT NULL,
        main_teacher_id UUID,
        CONSTRAINT fk_main_teacher_id FOREIGN KEY (main_teacher_id) REFERENCES teachers (id)
    );

CREATE TABLE
    teacher_classes (
        teacher_id UUID NOT NULL,
        class_id UUID NOT NULL,
        PRIMARY KEY (teacher_id, class_id),
        FOREIGN KEY (teacher_id) REFERENCES teachers (id),
        FOREIGN KEY (class_id) REFERENCES classes (id)
    );

-- Create user_classes table
CREATE TABLE
    student_classes (
        student_id UUID NOT NULL,
        class_id UUID NOT NULL,
        PRIMARY KEY (student_id, class_id),
        CONSTRAINT fk_student_id FOREIGN KEY (student_id) REFERENCES students (id),
        CONSTRAINT fk_class_id FOREIGN KEY (class_id) REFERENCES classes (id)
    );

-- Create courses table
CREATE TABLE
    IF NOT EXISTS courses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        teacher_id UUID NOT NULL,
        FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE
    );

-- Create lives table
CREATE TABLE
    IF NOT EXISTS lives (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        link VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        teacher_id UUID NOT NULL,
        FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE
    );

CREATE TABLE
    class_lives (
        class_id UUID NOT NULL,
        live_id UUID NOT NULL,
        PRIMARY KEY (class_id, live_id),
        FOREIGN KEY (class_id) REFERENCES classes (id),
        FOREIGN KEY (live_id) REFERENCES lives (id)
    );

-- Trigger to auto-update the 'updatedAt' column
CREATE
OR REPLACE FUNCTION update_updated_at_column ()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Attach the trigger to the students table
CREATE TRIGGER trigger_students_updated_at BEFORE
UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

-- Attach the trigger to the teachers table
CREATE TRIGGER trigger_teachers_updated_at BEFORE
UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

-- Attach the trigger to the administrateurs table
CREATE TRIGGER trigger_administrateurs_updated_at BEFORE
UPDATE ON administrateurs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

-- Attach the trigger to the lives table
CREATE TRIGGER trigger_lives_updated_at BEFORE
UPDATE ON lives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

-- Attach the trigger to the courses table
CREATE TRIGGER trigger_courses_updated_at BEFORE
UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column ();

-- Create indexes for faster lookup on username and email
CREATE INDEX IF NOT EXISTS idx_students_username ON students (username);

CREATE INDEX IF NOT EXISTS idx_students_email ON students (email);

CREATE INDEX IF NOT EXISTS idx_teachers_username ON teachers (username);

CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers (email);

CREATE INDEX IF NOT EXISTS idx_administrateurs_username ON administrateurs (username);

CREATE INDEX IF NOT EXISTS idx_administrateurs_email ON administrateurs (email);

-- Insert initial data into the students table
INSERT INTO
    students (id, username, email, password)
VALUES
    (
        'a6fa5fc1-1234-4321-0000-000000000001',
        'jdoe1',
        'john.doe@example.com',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    ),
    (
        'a6fa5fc1-1234-4321-0000-000000000002',
        'jdoe2',
        'jane.doe@example.com',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    );

-- Insert initial data into the teachers table
INSERT INTO
    teachers (id, username, email, password)
VALUES
    (
        'a6fa5fc1-1234-4321-0000-000000000003',
        'jdoe1',
        'john.doeprof@example.com',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    );

-- Insert initial data into the classes table
INSERT INTO
    classes (id, name, main_teacher_id)
VALUES
    (
        'a6fa5fc1-1234-4322-0000-000000000001',
        'BTS2X',
        'a6fa5fc1-1234-4321-0000-000000000003'
    );

-- Insert initial data into the user_classes table
INSERT INTO
    student_classes (student_id, class_id)
VALUES
    (
        'a6fa5fc1-1234-4321-0000-000000000002',
        'a6fa5fc1-1234-4322-0000-000000000001'
    );

-- Insert initial lives data
-- Make sure the teacher ID and class ID referenced here exist in the respective tables.
INSERT INTO
    lives (id, title, description,link, teacher_id)
VALUES
    (
        'a6fa5fc1-1234-4321-0000-000000000015',
        'Understanding JavaScript Closures',
        'An in-depth session on JavaScript closures and their applications.',
        '/api/lives/a6fa5fc1-1234-4321-0000-000000000015',
        'a6fa5fc1-1234-4321-0000-000000000003'
    );

-- Insert data into class_lives table to associate the live with a class
INSERT INTO
    class_lives (class_id, live_id)
VALUES
    (
        'a6fa5fc1-1234-4322-0000-000000000001', -- Class ID
        (SELECT id FROM lives WHERE title = 'Understanding JavaScript Closures')
    );


-- Insert initial courses data
-- Make sure the teacher IDs referenced here exist in the teachers table.
INSERT INTO
    courses (title, description, teacher_id)
VALUES
    (
        'Intro to Node.js',
        'Learn the basics of Node.js and Express.',
        'a6fa5fc1-1234-4321-0000-000000000003'
    ),
    (
        'React for Beginners',
        'Learn how to build user interfaces with React.',
        'a6fa5fc1-1234-4321-0000-000000000003'
    );

-- Optionally, create more advanced tables and logic for your app