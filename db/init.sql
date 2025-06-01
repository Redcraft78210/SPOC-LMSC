-- ============================================================
-- TYPES ET ÉNUMÉRATIONS
-- ============================================================
CREATE TYPE statut_type AS ENUM ('actif', 'inactif');
CREATE TYPE scan_status_type AS ENUM ('pending', 'clean', 'infected');
CREATE TYPE user_role AS ENUM ('Administrateur', 'Professeur', 'Etudiant');
CREATE TYPE live_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE attendance_status AS ENUM ('attended', 'missed');

-- ============================================================
-- TABLES PRINCIPALES
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "twoFAEnabled" BOOLEAN DEFAULT FALSE,
    "twoFASecret" VARCHAR(255),
    statut statut_type DEFAULT 'actif',
    "firstLogin" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    main_teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    "classId" UUID REFERENCES classes(id) ON DELETE RESTRICT,
    "usageLimit" INTEGER NOT NULL CHECK ("usageLimit" > 0),
    "remainingUses" INTEGER NOT NULL CHECK ("remainingUses" >= 0),
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matiere VARCHAR(255),
    chapitre VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(255) NOT NULL,
    chapter VARCHAR(255),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status live_status NOT NULL,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    fingerprint VARCHAR(255) NOT NULL,
    commit_msg VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint VARCHAR(255) NOT NULL,
    cover_image BYTEA,
    preview_image BYTEA,
    duration INTEGER DEFAULT 0,
    commit_msg VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        (preview_image IS NULL) AND
        (cover_image is not null and preview_image is null and duration > 0) OR
        (cover_image is not null and preview_image is not null and duration > 0) OR
        (cover_image is null and preview_image is null)
    )
);

CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    "authorId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    "authorId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "threadId" UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_avatars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    mime_type VARCHAR(128) NOT NULL,
    file_name VARCHAR(255),
    original_size INTEGER NOT NULL,
    compressed_size INTEGER NOT NULL,
    data BYTEA NOT NULL,
    compression_quality SMALLINT NOT NULL,
    dimensions VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    "senderId" UUID REFERENCES users(id) ON DELETE CASCADE,
    "recipientType" VARCHAR(50) NOT NULL CHECK ("recipientType" IN ('individual', 'multiple', 'all-admins', 'all-teachers', 'all-students')),
    "fromContactForm" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "MessageId" UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    "recipientId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    hidden BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "MessageId" UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" VARCHAR(255) NOT NULL,
    "scanStatus" scan_status_type DEFAULT 'pending',
    "deletedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registry_rgpd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) NOT NULL REFERENCES users(email),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLES DE JONCTION
-- ============================================================
CREATE TABLE teacher_classes (
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_id, class_id)
);

CREATE TABLE student_classes (
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, class_id)
);

CREATE TABLE course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status progress_status NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, course_id)
);

CREATE TABLE live_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    live_id UUID NOT NULL REFERENCES lives(id) ON DELETE CASCADE,
    status attendance_status NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, live_id)
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    live_id UUID NOT NULL REFERENCES lives(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE class_lives (
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    live_id UUID NOT NULL REFERENCES lives(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, live_id)
);

CREATE TABLE course_documents (
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    is_main BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (course_id, document_id)
);

CREATE TABLE course_videos (
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    is_main BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (course_id, video_id)
);

CREATE TABLE trash_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "originalMessageId" UUID,
  "deletedBy" UUID NOT NULL,
  "deletedAt" TIMESTAMP NOT NULL,
  "scheduledPurgeDate" TIMESTAMP,
  "permanentlyDeleted" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL
);

-- ============================================================
-- FONCTIONS ET TRIGGERS
-- ============================================================

-- Fonction générique de validation pour les relations utilisateur-rôle
CREATE OR REPLACE FUNCTION validate_user_role(user_id UUID, required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users WHERE id = user_id AND role = required_role
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger pour la validation du rôle enseignant dans les classes
CREATE OR REPLACE FUNCTION validate_teacher()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT validate_user_role(NEW.main_teacher_id, 'Professeur') THEN
        RAISE EXCEPTION 'User % is not a teacher', NEW.main_teacher_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Universal update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Application des triggers updatedAt à toutes les tables
DO $$ 
DECLARE
    tab TEXT;
BEGIN
    FOR tab IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('threads', 'comments') -- Tables sans updatedAt
    LOOP
        EXECUTE format('
            CREATE TRIGGER %s_updated_at 
            BEFORE UPDATE ON %s 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at()', 
            tab, tab);
    END LOOP;
END $$;

-- Application des triggers de validation
CREATE TRIGGER trg_classes_teacher 
BEFORE INSERT OR UPDATE ON classes
FOR EACH ROW EXECUTE FUNCTION validate_teacher();

-- ============================================================
-- INDEX ESSENTIELS 
-- ============================================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX idx_lives_teacher_id ON lives(teacher_id);
CREATE INDEX idx_chat_messages_live_id ON chat_messages(live_id);
CREATE INDEX idx_recipients_recipient_id ON recipients("recipientId");
CREATE INDEX idx_user_avatars_user_id ON user_avatars(user_id);


-- ============================================================
-- DONNÉES MINIMALES D'INITIALISATION
-- ============================================================
-- Admin
INSERT INTO users (id, name, surname, role, username, email, password)
VALUES ('a0000000-0000-0000-0000-000000000001', 'Admin', 'System', 'Administrateur', 'admin', 'admin@spoc.lmsc', '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2');

-- Code d'inscription initial
INSERT INTO codes (id, value, role, "usageLimit", "remainingUses", "expiresAt")
VALUES ('b0000000-0000-0000-0000-000000000001', 'ADMIN-INIT', 'Administrateur', 10, 10, '2030-01-01 00:00:00');

-- Trigger Functions
CREATE OR REPLACE FUNCTION validate_teacher_class()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.teacher_id 
        AND role = 'Professeur'
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
        AND role = 'Etudiant'
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
        AND role = 'Professeur'
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

CREATE OR REPLACE FUNCTION validate_course_documents()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM courses 
        WHERE id = NEW.course_id
    ) THEN
        RAISE EXCEPTION 'Course % does not exist', NEW.course_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_course_videos()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM courses 
        WHERE id = NEW.course_id
    ) THEN
        RAISE EXCEPTION 'Course % does not exist', NEW.course_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_course_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'User % does not exist', NEW.user_id;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM courses 
        WHERE id = NEW.course_id
    ) THEN
        RAISE EXCEPTION 'Course % does not exist', NEW.course_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_live_attendance()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'User % does not exist', NEW.user_id;
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

CREATE OR REPLACE FUNCTION validate_chat_messages()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'User % does not exist', NEW.user_id;
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

CREATE OR REPLACE FUNCTION validate_user_avatars()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'User % does not exist', NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_thread_comments()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM threads 
        WHERE id = NEW.threadId
    ) THEN
        RAISE EXCEPTION 'Thread % does not exist', NEW.threadId;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.authorId
    ) THEN
        RAISE EXCEPTION 'User % does not exist', NEW.authorId;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_thread()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.authorId
    ) THEN
        RAISE EXCEPTION 'User % does not exist', NEW.authorId;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
-- Optimized Indexes
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_codes_value ON codes (value);
CREATE INDEX idx_classes_main_teacher ON classes (main_teacher_id);


-- ÉTAPE 4: Créer des index pour améliorer les performances
CREATE INDEX idx_course_documents_course_id ON course_documents(course_id);
CREATE INDEX idx_course_documents_document_id ON course_documents(document_id);
CREATE INDEX idx_course_videos_course_id ON course_videos(course_id);
CREATE INDEX idx_course_videos_video_id ON course_videos(video_id);

-- Create indexes for better performance
CREATE INDEX idx_messages_contact_form ON messages("fromContactForm");
CREATE INDEX idx_recipients_message_id ON recipients("MessageId");
CREATE INDEX idx_recipients_read ON recipients(read);
CREATE INDEX idx_recipients_hidden ON recipients(hidden);
CREATE INDEX idx_attachments_message_id ON attachments("MessageId");
CREATE INDEX idx_attachments_scan_status ON attachments("scanStatus");
CREATE INDEX idx_registry_rgpd_user_email ON registry_rgpd(user_email);

-- Create validation function for message recipients
CREATE OR REPLACE FUNCTION validate_message_recipient()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW."recipientId"
    ) THEN
        RAISE EXCEPTION 'User % does not exist', NEW."recipientId";
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM messages 
        WHERE id = NEW."MessageId"
    ) THEN
        RAISE EXCEPTION 'Message % does not exist', NEW."MessageId";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation function for message sender
CREATE OR REPLACE FUNCTION validate_message_sender()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip validation if "senderId" is NULL (for contact form messages)
    IF NEW."senderId" IS NULL THEN
        -- NULL "senderId" is allowed when "fromContactForm" is TRUE
        IF NEW."fromContactForm" = TRUE THEN
            RETURN NEW;
        ELSE
            RAISE EXCEPTION 'NULL "senderId" is only allowed for contact form messages';
        END IF;
    END IF;
    
    -- For non-NULL "senderId", validate that the user exists
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW."senderId"
    ) THEN
        RAISE EXCEPTION 'User % does not exist', NEW."senderId";
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation function for attachments
CREATE OR REPLACE FUNCTION validate_attachment()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM messages 
        WHERE id = NEW."MessageId"
    ) THEN
        RAISE EXCEPTION 'Message % does not exist', NEW."MessageId";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation triggers
CREATE TRIGGER trg_recipients 
BEFORE INSERT OR UPDATE ON recipients
FOR EACH ROW EXECUTE FUNCTION validate_message_recipient();

CREATE TRIGGER trg_messages_sender 
BEFORE INSERT OR UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION validate_message_sender();

CREATE TRIGGER trg_attachments 
BEFORE INSERT OR UPDATE ON attachments
FOR EACH ROW EXECUTE FUNCTION validate_attachment();

-- Insert initial data into the teachers table
INSERT INTO
    users (id, name, surname, role, username, email, password)
VALUES
    (
        'a6fa5fc1-1234-4321-0000-000000000003',
        'John',
        'Doe',
        'Administrateur',
        'jdoe1_admin',
        'john.doeadmin@spoc.lmsc',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    ),
    (
        'a6fa5fc1-1234-4321-0000-000000000009',
        'Jane',
        'Doe',
        'Administrateur',        
        'jdoe2_admin',
        'jane.doeadmin@spoc.lmsc',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    ),
    (
        'a6fa5fc1-1234-4321-0000-000000000005',
        'Bob',
        'Smith',
        'Professeur',
        'bsmith_teacher',
        'bob.smithteacher@spoc.lmsc',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    ),
    (
        'a6fa5fc1-1234-4321-0000-000000000006',
        'Ewe',
        'Willi',
        'Professeur',
        'willi_teacher',
        'willi@spoc.lmsc',
        '$2b$05$eZDYdmMp4ZxVrl3um/hcp.G15wMNvB2/17OS7gBTtBnj4VtFIM6Z.'
    ),
    (
        'a6fa5fc1-1234-4321-0000-000000000007',
        'Charlie',
        'Brown',
        'Etudiant',
        'cbrown_student',
        'charlie.brownstudent@spoc.lmsc',
        '$2b$10$1Tl7ARRSx3HHsS8nehhTF.asiDLQ7IOzCJ1EzCoMGQBFysfFCdQc2'
    ),
    (
        'a6fa5fc1-1234-4321-0000-000000000008',
        'Emily',
        'Davis',
        'Etudiant',
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
        'Etudiant',
        10,
        10,
        '2026-01-01 00:00:00'
    ),
    -- Étudiant : code partiellement utilisé, expiration proche
    (
        '11111111-aaaa-bbbb-cccc-000000000002',
        'STU-HALF-USED',
        'Etudiant',
        10,
        4,
        '2025-05-15 00:00:00'
    ),
    -- Étudiant : code expiré, plus de remaining
    (
        '11111111-aaaa-bbbb-cccc-000000000003',
        'STU-EXPIRED',
        'Etudiant',
        10,
        1,
        '2024-12-31 00:00:00'
    ),
    -- Enseignant : code encore actif avec des utilisations restantes
    (
        '11111111-aaaa-bbbb-cccc-000000000004',
        'TEACH-ACTIVE-01',
        'Professeur',
        20,
        15,
        '2025-11-01 00:00:00'
    ),
    -- Enseignant : code bientôt expiré, utilisations faibles
    (
        '11111111-aaaa-bbbb-cccc-000000000005',
        'TEACH-LIMITED',
        'Professeur',
        20,
        2,
        '2025-04-30 00:00:00'
    ),
    -- Admin : code full access, date très lointaine
    (
        '11111111-aaaa-bbbb-cccc-000000000006',
        'ADMIN-FULL',
        'Administrateur',
        100,
        100,
        '2030-01-01 00:00:00'
    ),
    -- Admin : code expiré mais utilisations restantes (pour test logique)
    (
        '11111111-aaaa-bbbb-cccc-000000000007',
        'ADMIN-EXPIRED',
        'Administrateur',
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
    lives (id, title, description, subject, chapter, start_time, end_time, status, teacher_id)
VALUES
    (
        'a6fa5fc1-1234-4321-0000-000000000015',
        'Understanding JavaScript Closures',
        'An in-depth session on JavaScript closures and their applications.',
        'Programmation',
        'JS',
        '2024-05-01 10:00:00',
        '2024-05-01 11:00:00',
        'scheduled',
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

insert into courses (id, title, description, is_published, teacher_id, matiere, chapitre)
values
('7f4b5385-04fa-cde3-c881-b73844f52f25', 'Introduction to Quantum Mechanics', 'A beginner-friendly course on the principles of quantum mechanics.', TRUE, 'a6fa5fc1-1234-4321-0000-000000000005', 'Physics', 'Fundamentals'),
('a6fa5fc1-1234-4321-0000-000000000012', 'Advanced Quantum Physics', 'An advanced course covering complex topics in quantum physics.', TRUE, 'a6fa5fc1-1234-4321-0000-000000000005', 'Physics', 'Advanced Topics'),
('a6fa5fc1-1234-4321-0000-000000000013', 'Quantum Computing Basics', 'An introduction to the principles of quantum computing.', TRUE, 'a6fa5fc1-1234-4321-0000-000000000005', 'Computer Science', 'Quantum Computing'),
('a6fa5fc1-1234-4321-0000-000000000014', 'Quantum Entanglement Explained', 'A detailed look at the phenomenon of quantum entanglement.', TRUE, 'a6fa5fc1-1234-4321-0000-000000000005', 'Physics', 'Quantum Phenomena');

INSERT INTO
    documents (id, title, description, fingerprint, commit_msg)
VALUES
    ('a6fa5fc1-1234-4321-0000-000000000016', 'Fondamentaux de la mécanique quantique', 'Document principal couvrant les principes fondamentaux de la mécanique quantique, incluant les équations de Schrödinger et les postulats de base.', '2e3d4c5b', 'Initial commit for the course document.'),
    ('a6fa5fc1-1234-4321-0000-000000000040', 'Physique quantique avancée: théorie et applications', 'Document complet sur les théories quantiques avancées, incluant la théorie quantique des champs et les applications expérimentales récentes.', '2e3d4c5b', 'Initial commit for the advanced course document.'),
    ('a6fa5fc1-1234-4321-0000-000000000041', 'Introduction à l''informatique quantique', 'Document explicatif sur les qubits, les portes quantiques et les algorithmes fondamentaux comme celui de Shor et de Grover.', '3e4d5c6b', 'Initial commit for the quantum computing document.'),
    ('a6fa5fc1-1234-4321-0000-000000000042', 'L''intrication quantique expliquée', 'Document détaillant le phénomène d''intrication quantique, les expériences EPR et les implications pour la téléportation quantique.', '4e5d6c7b', 'Initial commit for the entanglement document.');

-- Document-course relationships in the junction table
INSERT INTO
    course_documents (course_id, document_id, is_main)
VALUES
    ('7f4b5385-04fa-cde3-c881-b73844f52f25', 'a6fa5fc1-1234-4321-0000-000000000016', TRUE),
    ('a6fa5fc1-1234-4321-0000-000000000012', 'a6fa5fc1-1234-4321-0000-000000000016', TRUE),
    ('a6fa5fc1-1234-4321-0000-000000000013', 'a6fa5fc1-1234-4321-0000-000000000016', TRUE),
    ('a6fa5fc1-1234-4321-0000-000000000014', 'a6fa5fc1-1234-4321-0000-000000000016', TRUE);

-- Updated video inserts - without course_id and is_main
INSERT INTO
    videos (id, fingerprint, commit_msg)
VALUES
    ('7f4b5385-04fa-cde3-c881-b73844f52f27', '5f6e7d8c', 'Initial commit for the course video.'),
    ('a6fa5fc1-1234-4321-0000-000000000020', '7f8e9d0c', 'Initial commit for the quantum computing video.'),
    ('a6fa5fc1-1234-4321-0000-000000000021', '8f9e0d1c', 'Initial commit for the entanglement video.');

-- Video-course relationships in the junction table
INSERT INTO
    course_videos (course_id, video_id, is_main)
VALUES
    ('7f4b5385-04fa-cde3-c881-b73844f52f25', '7f4b5385-04fa-cde3-c881-b73844f52f27', TRUE),
    ('a6fa5fc1-1234-4321-0000-000000000013', 'a6fa5fc1-1234-4321-0000-000000000020', TRUE),
    ('a6fa5fc1-1234-4321-0000-000000000014', 'a6fa5fc1-1234-4321-0000-000000000021', TRUE);

-- Insert some sample messages
INSERT INTO messages (id, subject, content, "senderId", "recipientType", "fromContactForm")
VALUES
    ('33333333-aaaa-bbbb-cccc-000000000001', 'Bienvenue sur la plateforme', 'Bonjour et bienvenue sur notre plateforme d''apprentissage. N''hésitez pas à contacter l''équipe administrative si vous avez des questions.', 'a6fa5fc1-1234-4321-0000-000000000007', 'multiple', FALSE),
    ('33333333-aaaa-bbbb-cccc-000000000002', 'Question sur le cours de JavaScript', 'Bonjour, j''ai une question concernant le dernier cours sur les closures en JavaScript. Pourriez-vous préciser leur utilité dans un contexte réel ?', 'a6fa5fc1-1234-4321-0000-000000000007', 'individual', FALSE),
    ('33333333-aaaa-bbbb-cccc-000000000003', 'Demande de contact via formulaire', 'Bonjour, je suis intéressé par vos formations en ligne. Pouvez-vous me donner plus d''informations sur les prérequis pour la formation en développement web ?', NULL, 'all-admins', TRUE);

-- Insert message recipients
INSERT INTO recipients ("MessageId", "recipientId", read)
VALUES
    ('33333333-aaaa-bbbb-cccc-000000000001', 'a6fa5fc1-1234-4321-0000-000000000007', TRUE),
    ('33333333-aaaa-bbbb-cccc-000000000001', 'a6fa5fc1-1234-4321-0000-000000000008', FALSE),
    ('33333333-aaaa-bbbb-cccc-000000000002', 'a6fa5fc1-1234-4321-0000-000000000005', TRUE),
    ('33333333-aaaa-bbbb-cccc-000000000003', 'a6fa5fc1-1234-4321-0000-000000000003', FALSE),
    ('33333333-aaaa-bbbb-cccc-000000000003', 'a6fa5fc1-1234-4321-0000-000000000009', FALSE);

-- Insert sample attachment
INSERT INTO attachments ("MessageId", filename, "fileSize", "mimeType", "scanStatus")
VALUES
    ('33333333-aaaa-bbbb-cccc-000000000002', 'question_code.js', 1024, 'application/javascript', 'clean');
