-- Create ENUM type for status
CREATE TYPE statut_type AS ENUM ('actif', 'inactif');

-- Create unified users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    username VARCHAR(255) UNIQUE,
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

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    main_teacher_id UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (main_teacher_id) 
        REFERENCES users(id) 
        ON DELETE RESTRICT
        DEFERRABLE INITIALLY DEFERRED
);

-- Create codes table
CREATE TABLE IF NOT EXISTS codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    "classId" UUID,
    "usageLimit" INTEGER NOT NULL CHECK ("usageLimit" > 0),
    "remainingUses" INTEGER NOT NULL CHECK ("remainingUses" >= 0),
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("classId")
        REFERENCES classes(id)
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
    title VARCHAR(255) NOT NULL,            -- corresponds to titre in model
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- corresponds to date_creation
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT FALSE,     -- missing from table
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_name VARCHAR(255),              -- missing from table
    matiere VARCHAR(255),                   -- missing from table
    chapitre VARCHAR(255),                  -- missing from table
    CONSTRAINT fk_teacher 
      FOREIGN KEY (teacher_id)
      REFERENCES users(id)
      ON DELETE CASCADE
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

CREATE TABLE IF NOT EXISTS course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(255) NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS live_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    live_id UUID NOT NULL REFERENCES lives(id) ON DELETE CASCADE,
    status VARCHAR(255) NOT NULL CHECK (status IN ('attended', 'missed')),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, live_id)
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    live_id UUID NOT NULL REFERENCES lives(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for class-lives relationships
CREATE TABLE IF NOT EXISTS class_lives (
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    live_id UUID NOT NULL REFERENCES lives(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, live_id)
);

-- Create threads table
CREATE TABLE IF NOT EXISTS threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    "authorId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    "authorId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "threadId" UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour stocker les avatars des utilisateurs
CREATE TABLE IF NOT EXISTS user_avatars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mime_type VARCHAR(128) NOT NULL,
    file_name VARCHAR(255),
    original_size INTEGER NOT NULL,
    compressed_size INTEGER NOT NULL,
    data BYTEA NOT NULL,
    compression_quality SMALLINT NOT NULL,
    dimensions VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id)
);

-- Index pour optimiser les recherches par user_id
CREATE INDEX IF NOT EXISTS idx_user_avatars_user_id ON user_avatars(user_id);

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

CREATE TRIGGER user_avatars_updated_at BEFORE UPDATE ON user_avatars
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER codes_updated_at BEFORE UPDATE ON codes
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER classes_updated_at BEFORE UPDATE ON classes
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER lives_updated_at BEFORE UPDATE ON lives
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chat_updated_at BEFORE UPDATE ON chat_messages
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER student_stats_updated_at BEFORE UPDATE ON course_progress
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER student_stats_updated_at BEFORE UPDATE ON live_attendance
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

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path VARCHAR(255) NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    commit_msg VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path VARCHAR(255) NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    commit_msg VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create triggers for updating timestamp
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER videos_updated_at BEFORE UPDATE ON videos
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_documents_course_id ON documents(course_id);
CREATE INDEX idx_videos_course_id ON videos(course_id);

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
        'Ewe',
        'Willi',
        'teacher',
        'willi_teacher',
        'willi@spoc.lmsc',
        '$2b$05$eZDYdmMp4ZxVrl3um/hcp.G15wMNvB2/17OS7gBTtBnj4VtFIM6Z.'
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
    classes (id, name, description, main_teacher_id)
VALUES
    (
        'a6fa5fc1-1234-4322-0000-000000000001',
        'BTS2X',
        'Description de la classe BTS2X',
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

-- Insert initial data into the threads table
INSERT INTO
    threads (id, title, content, "authorId")
VALUES
    ('11111111-aaaa-bbbb-cccc-000000000001', 'Introduction to SQL', 'This thread discusses the basics of SQL.', 'a6fa5fc1-1234-4321-0000-000000000005'),
    ('11111111-aaaa-bbbb-cccc-000000000002', 'Advanced JavaScript', 'Let''s dive into advanced JavaScript concepts.', 'a6fa5fc1-1234-4321-0000-000000000006'),
    ('11111111-aaaa-bbbb-cccc-000000000003', 'Python for Data Science', 'A thread for Python enthusiasts.', 'a6fa5fc1-1234-4321-0000-000000000007'),
    ('11111111-aaaa-bbbb-cccc-000000000004', 'React vs Angular', 'Which framework do you prefer and why?', 'a6fa5fc1-1234-4321-0000-000000000008'),
    ('11111111-aaaa-bbbb-cccc-000000000005', 'Machine Learning Basics', 'Discussing the fundamentals of ML.', 'a6fa5fc1-1234-4321-0000-000000000005'),
    ('11111111-aaaa-bbbb-cccc-000000000006', 'Docker for Beginners', 'How to get started with Docker.', 'a6fa5fc1-1234-4321-0000-000000000006'),
    ('11111111-aaaa-bbbb-cccc-000000000007', 'Understanding REST APIs', 'A thread about building and using REST APIs.', 'a6fa5fc1-1234-4321-0000-000000000007'),
    ('11111111-aaaa-bbbb-cccc-000000000008', 'CSS Grid vs Flexbox', 'Which layout system do you prefer?', 'a6fa5fc1-1234-4321-0000-000000000008'),
    ('11111111-aaaa-bbbb-cccc-000000000009', 'Kubernetes Essentials', 'An introduction to Kubernetes.', 'a6fa5fc1-1234-4321-0000-000000000005'),
    ('11111111-aaaa-bbbb-cccc-000000000010', 'GraphQL vs REST', 'Pros and cons of GraphQL and REST.', 'a6fa5fc1-1234-4321-0000-000000000006');

-- Insert initial data into the comments table
INSERT INTO
    comments (id, content, "authorId", "threadId")
VALUES
    ('22222222-aaaa-bbbb-cccc-000000000001', 'Great introduction to SQL!', 'a6fa5fc1-1234-4321-0000-000000000007', '11111111-aaaa-bbbb-cccc-000000000001'),
    ('22222222-aaaa-bbbb-cccc-000000000002', 'I prefer Angular for enterprise apps.', 'a6fa5fc1-1234-4321-0000-000000000008', '11111111-aaaa-bbbb-cccc-000000000004'),
    ('22222222-aaaa-bbbb-cccc-000000000003', 'Python is indeed great for data science.', 'a6fa5fc1-1234-4321-0000-000000000005', '11111111-aaaa-bbbb-cccc-000000000003'),
    ('22222222-aaaa-bbbb-cccc-000000000004', 'REST APIs are simple and effective.', 'a6fa5fc1-1234-4321-0000-000000000006', '11111111-aaaa-bbbb-cccc-000000000007'),
    ('22222222-aaaa-bbbb-cccc-000000000005', 'CSS Grid is more powerful for complex layouts.', 'a6fa5fc1-1234-4321-0000-000000000007', '11111111-aaaa-bbbb-cccc-000000000008'),
    ('22222222-aaaa-bbbb-cccc-000000000006', 'Docker has simplified my deployment process.', 'a6fa5fc1-1234-4321-0000-000000000008', '11111111-aaaa-bbbb-cccc-000000000006'),
    ('22222222-aaaa-bbbb-cccc-000000000007', 'Machine learning is fascinating!', 'a6fa5fc1-1234-4321-0000-000000000005', '11111111-aaaa-bbbb-cccc-000000000005'),
    ('22222222-aaaa-bbbb-cccc-000000000008', 'GraphQL is great for complex queries.', 'a6fa5fc1-1234-4321-0000-000000000006', '11111111-aaaa-bbbb-cccc-000000000010'),
    ('22222222-aaaa-bbbb-cccc-000000000009', 'Kubernetes is a game-changer for container orchestration.', 'a6fa5fc1-1234-4321-0000-000000000007', '11111111-aaaa-bbbb-cccc-000000000009'),
    ('22222222-aaaa-bbbb-cccc-000000000010', 'Advanced JavaScript concepts are tricky but rewarding.', 'a6fa5fc1-1234-4321-0000-000000000008', '11111111-aaaa-bbbb-cccc-000000000002');

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

insert into chat_messages (content, user_id, live_id)
values
('Salut, j''espère que vous allez bien !', 'a6fa5fc1-1234-4321-0000-000000000006', 'a6fa5fc1-1234-4321-0000-000000000015'),
('Bonjour à tous !', 'a6fa5fc1-1234-4321-0000-000000000007', 'a6fa5fc1-1234-4321-0000-000000000015'),
('Bienvenue au live, n''hésitez pas à poser vos questions', 'a6fa5fc1-1234-4321-0000-000000000005', 'a6fa5fc1-1234-4321-0000-000000000015'),
('Merci, hâte de commencer !', 'a6fa5fc1-1234-4321-0000-000000000008', 'a6fa5fc1-1234-4321-0000-000000000015'),
('Quelle est la durée prévue pour ce live ?', 'a6fa5fc1-1234-4321-0000-000000000007', 'a6fa5fc1-1234-4321-0000-000000000015'),
('Environ 1 heure, avec une session de questions à la fin.', 'a6fa5fc1-1234-4321-0000-000000000005', 'a6fa5fc1-1234-4321-0000-000000000015'),
('Est-ce que les slides seront disponibles après le live ?', 'a6fa5fc1-1234-4321-0000-000000000008', 'a6fa5fc1-1234-4321-0000-000000000015'),
('Oui, je les partagerai à la fin.', 'a6fa5fc1-1234-4321-0000-000000000005', 'a6fa5fc1-1234-4321-0000-000000000015'),
('Super, merci beaucoup !', 'a6fa5fc1-1234-4321-0000-000000000008', 'a6fa5fc1-1234-4321-0000-000000000015'),
('Est-ce que vous allez parler du principe d’incertitude ?', 'a6fa5fc1-1234-4321-0000-000000000007', 'a6fa5fc1-1234-4321-0000-000000000015'),
('Oui, c’est prévu dans la deuxième partie du live.', 'a6fa5fc1-1234-4321-0000-000000000005', 'a6fa5fc1-1234-4321-0000-000000000015'),
('Merci pour cette précision.', 'a6fa5fc1-1234-4321-0000-000000000008', 'a6fa5fc1-1234-4321-0000-000000000015'),
('Est-ce que vous allez aussi parler de la dualité onde-particule ?', 'a6fa5fc1-1234-4321-0000-000000000008', 'a6fa5fc1-1234-4321-0000-000000000015'),
('Absolument, c’est un des sujets principaux.', 'a6fa5fc1-1234-4321-0000-000000000005', 'a6fa5fc1-1234-4321-0000-000000000015');

insert into courses (id, title, description, is_published, teacher_id, teacher_name, matiere, chapitre)
values
('7f4b5385-04fa-cde3-c881-b73844f52f25', 'Introduction to Quantum Mechanics', 'A beginner-friendly course on the principles of quantum mechanics.', TRUE, 'a6fa5fc1-1234-4321-0000-000000000005', 'Bob Smith', 'Physics', 'Fundamentals'),
('a6fa5fc1-1234-4321-0000-000000000012', 'Advanced Quantum Physics', 'An advanced course covering complex topics in quantum physics.', TRUE, 'a6fa5fc1-1234-4321-0000-000000000005', 'Bob Smith', 'Physics', 'Advanced Topics'),
('a6fa5fc1-1234-4321-0000-000000000013', 'Quantum Computing Basics', 'An introduction to the principles of quantum computing.', TRUE, 'a6fa5fc1-1234-4321-0000-000000000005', 'Bob Smith', 'Computer Science', 'Quantum Computing'),
('a6fa5fc1-1234-4321-0000-000000000014', 'Quantum Entanglement Explained', 'A detailed look at the phenomenon of quantum entanglement.', TRUE, 'a6fa5fc1-1234-4321-0000-000000000005', 'Bob Smith', 'Physics', 'Quantum Phenomena');