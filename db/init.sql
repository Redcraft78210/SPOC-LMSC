-- Create ENUM type for status
CREATE TYPE statut_type AS ENUM ('actif', 'inactif');

-- Create unified users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "twoFAEnabled" BOOLEAN DEFAULT FALSE,
    "twoFASecret" VARCHAR(255),
    statut statut_type DEFAULT 'actif',
    "firstLogin" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Improved 2FA validation
    CHECK (
        ("twoFAEnabled" = TRUE AND "twoFASecret" IS NOT NULL) OR
        ("twoFAEnabled" = FALSE AND "twoFASecret" IS NOT NULL) OR
        ("twoFAEnabled" = FALSE AND "twoFASecret" IS NULL)
    )
);

-- Create codes table
CREATE TABLE IF NOT EXISTS codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    "usageLimit" INTEGER NOT NULL CHECK ("usageLimit" > 0),
    "remainingUses" INTEGER NOT NULL CHECK ("remainingUses" >= 0),
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    main_teacher_id UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (main_teacher_id) 
        REFERENCES users(id) 
        ON DELETE RESTRICT
        DEFERRABLE INITIALLY DEFERRED
);

-- Junction table for teacher-class relationships
CREATE TABLE IF NOT EXISTS teacher_classes (
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_id, class_id)
);

-- Junction table for student-class relationships
CREATE TABLE IF NOT EXISTS student_classes (
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, class_id)
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create lives table
CREATE TABLE IF NOT EXISTS lives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    link VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Junction table for class-lives relationships
CREATE TABLE IF NOT EXISTS class_lives (
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    live_id UUID NOT NULL REFERENCES lives(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, live_id)
);

-- Trigger Functions
CREATE OR REPLACE FUNCTION validate_teacher()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.main_teacher_id 
        AND role = 'teacher'
    ) THEN
        RAISE EXCEPTION 'User % is not a teacher', NEW.main_teacher_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_teacher_class()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.teacher_id 
        AND role = 'teacher'
    ) THEN
        RAISE EXCEPTION 'User % is not a teacher', NEW.teacher_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_student_class()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.student_id 
        AND role = 'student'
    ) THEN
        RAISE EXCEPTION 'User % is not a student', NEW.student_id;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM classes
        WHERE id = NEW.class_id
    ) THEN
        RAISE EXCEPTION 'Classe % does not exist', NEW.class_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_course_teacher()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.teacher_id 
        AND role = 'teacher'
    ) THEN
        RAISE EXCEPTION 'User % is not a teacher', NEW.teacher_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_class_lives()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM classes 
        WHERE id = NEW.class_id
    ) THEN
        RAISE EXCEPTION 'Classe % does not exist', NEW.class_id;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM lives 
        WHERE id = NEW.live_id
    ) THEN
        RAISE EXCEPTION 'Live % does not exist', NEW.live_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
CREATE TRIGGER trg_classes_teacher 
BEFORE INSERT OR UPDATE ON classes
FOR EACH ROW EXECUTE FUNCTION validate_teacher();

CREATE TRIGGER trg_teacher_classes 
BEFORE INSERT OR UPDATE ON teacher_classes
FOR EACH ROW EXECUTE FUNCTION validate_teacher_class();

CREATE TRIGGER trg_student_classes 
BEFORE INSERT OR UPDATE ON student_classes
FOR EACH ROW EXECUTE FUNCTION validate_student_class();

CREATE TRIGGER trg_courses_teacher 
BEFORE INSERT OR UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION validate_course_teacher();

CREATE TRIGGER trg_lives_teacher 
BEFORE INSERT OR UPDATE ON lives
FOR EACH ROW EXECUTE FUNCTION validate_course_teacher();

CREATE TRIGGER trg_class_lives 
BEFORE INSERT OR UPDATE ON class_lives
FOR EACH ROW EXECUTE FUNCTION validate_class_lives();

-- Universal update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER codes_updated_at BEFORE UPDATE ON codes
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER classes_updated_at BEFORE UPDATE ON classes
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER lives_updated_at BEFORE UPDATE ON lives
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Optimized Indexes
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_codes_value ON codes (value);
CREATE INDEX idx_classes_main_teacher ON classes (main_teacher_id);

-- Attach the trigger to the courses table
CREATE TRIGGER trigger_courses_updated_at BEFORE
UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert initial data into the teachers table
INSERT INTO
    users (id, name, surname, role, username, email, password)
VALUES
    (
        'a6fa5fc1-1234-4321-0000-000000000003',
        'John',
        'Doe',
        'admin',
        'jdoe1_admin',
        'john.doeadmin@spoc.lmsc',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    ),
    (
        'a6fa5fc1-1234-4321-0000-000000000009',
        'Jane',
        'Doe',
        'admin',        
        'jdoe2_admin',
        'jane.doeadmin@spoc.lmsc',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    ),
    (
        'a6fa5fc1-1234-4321-0000-000000000005',
        'Bob',
        'Smith',
        'teacher',
        'bsmith_teacher',
        'bob.smithteacher@spoc.lmsc',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    ),
    (
        'a6fa5fc1-1234-4321-0000-000000000006',
        'Alice',
        'Johnson',
        'teacher',
        'ajohnson_teacher',
        'alice.johnsonteacher@spoc.lmsc',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    ),
    (
        'a6fa5fc1-1234-4321-0000-000000000007',
        'Charlie',
        'Brown',
        'student',
        'cbrown_student',
        'charlie.brownstudent@spoc.lmsc',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    ),
    (
        'a6fa5fc1-1234-4321-0000-000000000008',
        'Emily',
        'Davis',
        'student',
        'edavis_student',
        'emily.disvstudent@spoc.lmsc',
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
        'a6fa5fc1-1234-4321-0000-000000000005'
    );

-- Insert initial data into the student_classes table
INSERT INTO
    student_classes (student_id, class_id)
VALUES
    (
        'a6fa5fc1-1234-4321-0000-000000000007',
        'a6fa5fc1-1234-4322-0000-000000000001'
    );

-- Insert initial lives data
INSERT INTO
    lives (id, title, description, link, teacher_id)
VALUES
    (
        'a6fa5fc1-1234-4321-0000-000000000015',
        'Understanding JavaScript Closures',
        'An in-depth session on JavaScript closures and their applications.',
        '/api/lives/a6fa5fc1-1234-4321-0000-000000000015',
        'a6fa5fc1-1234-4321-0000-000000000005'
    );

-- Insert data into class_lives table to associate the live with a class
INSERT INTO
    class_lives (class_id, live_id)
VALUES
    (
        'a6fa5fc1-1234-4322-0000-000000000001',
        'a6fa5fc1-1234-4321-0000-000000000015'
    );
