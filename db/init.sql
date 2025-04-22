CREATE TYPE statut_type AS ENUM ('actif', 'inactif');

-- Create administrateurs table
CREATE TABLE IF NOT EXISTS administrateurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "twoFAEnabled" BOOLEAN DEFAULT FALSE CHECK (
        ("twoFAEnabled" = TRUE AND "twoFASecret" IS NOT NULL) OR
        ("twoFAEnabled" = FALSE AND "twoFASecret" IS NOT NULL) OR
        ("twoFAEnabled" = FALSE AND "twoFASecret" IS NULL)
    ),
    "twoFASecret" VARCHAR(255),
    statut statut_type DEFAULT 'actif',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "twoFAEnabled" BOOLEAN DEFAULT FALSE CHECK (
        ("twoFAEnabled" = TRUE AND "twoFASecret" IS NOT NULL) OR
        ("twoFAEnabled" = FALSE AND "twoFASecret" IS NOT NULL) OR
        ("twoFAEnabled" = FALSE AND "twoFASecret" IS NULL)
    ),
    "twoFASecret" VARCHAR(255),
    statut "statut_type" DEFAULT 'actif',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "twoFAEnabled" BOOLEAN DEFAULT FALSE CHECK (
        ("twoFAEnabled" = TRUE AND "twoFASecret" IS NOT NULL) OR
        ("twoFAEnabled" = FALSE AND "twoFASecret" IS NOT NULL) OR
        ("twoFAEnabled" = FALSE AND "twoFASecret" IS NULL)
    ),
    "twoFASecret" VARCHAR(255),
    statut "statut_type" DEFAULT 'actif',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create codes table
CREATE TABLE IF NOT EXISTS codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    "usageLimit" INTEGER NOT NULL,
    "remainingUses" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    main_teacher_id UUID,
    CONSTRAINT fk_main_teacher_id FOREIGN KEY (main_teacher_id) REFERENCES teachers (id)
);

CREATE TABLE teacher_classes (
    teacher_id UUID NOT NULL,
    class_id UUID NOT NULL,
    PRIMARY KEY (teacher_id, class_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers (id),
    FOREIGN KEY (class_id) REFERENCES classes (id)
);

-- Create user_classes table
CREATE TABLE student_classes (
    student_id UUID NOT NULL,
    class_id UUID NOT NULL,
    PRIMARY KEY (student_id, class_id),
    CONSTRAINT fk_student_id FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_class_id FOREIGN KEY (class_id) REFERENCES classes (id)
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    teacher_id UUID NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE
);

-- Create lives table
CREATE TABLE IF NOT EXISTS lives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    link VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    teacher_id UUID NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE
);

CREATE TABLE class_lives (
    class_id UUID NOT NULL,
    live_id UUID NOT NULL,
    PRIMARY KEY (class_id, live_id),
    FOREIGN KEY (class_id) REFERENCES classes (id),
    FOREIGN KEY (live_id) REFERENCES lives (id)
);

-- Trigger to auto-update the 'updatedAt' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the students table
CREATE TRIGGER trigger_students_updated_at BEFORE
UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Attach the trigger to the teachers table
CREATE TRIGGER trigger_teachers_updated_at BEFORE
UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Attach the trigger to the administrateurs table
CREATE TRIGGER trigger_administrateurs_updated_at BEFORE
UPDATE ON administrateurs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Attach the trigger to the lives table
CREATE TRIGGER trigger_lives_updated_at BEFORE
UPDATE ON lives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Attach the trigger to the courses table
CREATE TRIGGER trigger_courses_updated_at BEFORE
UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for faster lookup on username and email
CREATE INDEX IF NOT EXISTS idx_students_username ON students (username);

CREATE INDEX IF NOT EXISTS idx_students_email ON students (email);

CREATE INDEX IF NOT EXISTS idx_teachers_username ON teachers (username);

CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers (email);

CREATE INDEX IF NOT EXISTS idx_administrateurs_username ON administrateurs (username);

CREATE INDEX IF NOT EXISTS idx_administrateurs_email ON administrateurs (email);

-- Insert initial data into the teachers table
INSERT INTO
    administrateurs (id, name, surname, username, email, password)
VALUES
    (
        'a6fa5fc1-1234-4321-0000-000000000003',
        'John',
        'Doe',
        'jdoe1_admin',
        'john.doeadmin@example.com',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    ),
    (
        'a6fa5fc1-1234-4321-0000-000000000009',
        'Jane',
        'Doe',
        'jdoe2_admin',
        'jane.doeadmin@example.com',
        '$2a$10$.P8QYMzksJLNnQPHBYGGiuEXcqhhXQUv0N2ZeurEoWW8jpJxUjdCK'
    );

-- Insert initial data into the teachers table
INSERT INTO
    teachers (id, name, surname, username, email, password)
VALUES
    (
        'a6fa5fc1-1234-4321-0000-000000000003',
        'John',
        'Doe',
        'jdoe1_prof',
        'john.doeprof@example.com',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    ),
    (
        'a6fa5fc1-1234-4321-0000-000000000009',
        'Jane',
        'Doe',
        'jdoe2_prof',
        'jane.doeprof@example.com',
        '$2a$10$.P8QYMzksJLNnQPHBYGGiuEXcqhhXQUv0N2ZeurEoWW8jpJxUjdCK'
    );

-- Insert initial data into the students table
INSERT INTO
    students (id, name, surname, username, email, password)
VALUES
    (
        'a6fa5fc1-1234-4321-0000-000000000001',
        'John',
        'Doe',
        'jdoe1',
        'john.doe@example.com',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    ),
    (
        'a6fa5fc1-1234-4321-0000-000000000002',
        'Jane',
        'Doe',
        'jdoe2',
        'jane.doe@example.com',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    );

-- Insert diversified demo codes into the codes table
INSERT INTO
    codes (id, value, role, "usageLimit", "remainingUses", "expiresAt")
VALUES
    -- Étudiant : code neuf, date lointaine
    (
        '11111111-aaaa-bbbb-cccc-000000000001',
        'STU-FRESH-01',
        'student',
        10,
        10,
        '2026-01-01 00:00:00'
    ),
    -- Étudiant : code partiellement utilisé, expiration proche
    (
        '11111111-aaaa-bbbb-cccc-000000000002',
        'STU-HALF-USED',
        'student',
        10,
        4,
        '2025-05-15 00:00:00'
    ),
    -- Étudiant : code expiré, plus de remaining
    (
        '11111111-aaaa-bbbb-cccc-000000000003',
        'STU-EXPIRED',
        'student',
        10,
        1,
        '2024-12-31 00:00:00'
    ),
    -- Enseignant : code encore actif avec des utilisations restantes
    (
        '11111111-aaaa-bbbb-cccc-000000000004',
        'TEACH-ACTIVE-01',
        'teacher',
        20,
        15,
        '2025-11-01 00:00:00'
    ),
    -- Enseignant : code bientôt expiré, utilisations faibles
    (
        '11111111-aaaa-bbbb-cccc-000000000005',
        'TEACH-LIMITED',
        'teacher',
        20,
        2,
        '2025-04-30 00:00:00'
    ),
    -- Admin : code full access, date très lointaine
    (
        '11111111-aaaa-bbbb-cccc-000000000006',
        'ADMIN-FULL',
        'admin',
        100,
        100,
        '2030-01-01 00:00:00'
    ),
    -- Admin : code expiré mais utilisations restantes (pour test logique)
    (
        '11111111-aaaa-bbbb-cccc-000000000007',
        'ADMIN-EXPIRED',
        'admin',
        50,
        25,
        '2024-01-01 00:00:00'
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
    lives (id, title, description, link, teacher_id)
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
