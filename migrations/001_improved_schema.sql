-- Migration pour améliorer le schéma de base de données SecureMessenger
-- Version: 001
-- Date: 2025-01-15

-- Ajouter les nouvelles colonnes à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid() UNIQUE,
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS public_key TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Modifier les types de colonnes existantes
ALTER TABLE users 
ALTER COLUMN username TYPE VARCHAR(50),
ALTER COLUMN access_code TYPE VARCHAR(20),
ALTER COLUMN phone TYPE VARCHAR(20),
ALTER COLUMN status TYPE VARCHAR(50);

-- Créer les index pour la table users
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);
CREATE INDEX IF NOT EXISTS users_access_code_idx ON users(access_code);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_status_idx ON users(status);

-- Créer la table groups
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    avatar TEXT,
    created_by INTEGER REFERENCES users(id) NOT NULL,
    is_private BOOLEAN DEFAULT FALSE,
    max_members INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS groups_name_idx ON groups(name);
CREATE INDEX IF NOT EXISTS groups_created_by_idx ON groups(created_by);

-- Créer la table group_members
CREATE TABLE IF NOT EXISTS group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_members_group_id_idx ON group_members(group_id);
CREATE INDEX IF NOT EXISTS group_members_user_id_idx ON group_members(user_id);

-- Modifier la table discussions
ALTER TABLE discussions 
ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid() UNIQUE,
ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'private',
ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES groups(id),
ADD COLUMN IF NOT EXISTS name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Renommer la colonne timestamp en discussions
ALTER TABLE discussions RENAME COLUMN timestamp TO old_timestamp;

CREATE INDEX IF NOT EXISTS discussions_type_idx ON discussions(type);
CREATE INDEX IF NOT EXISTS discussions_group_id_idx ON discussions(group_id);
CREATE INDEX IF NOT EXISTS discussions_last_activity_idx ON discussions(last_activity);

-- Créer la table discussion_participants
CREATE TABLE IF NOT EXISTS discussion_participants (
    id SERIAL PRIMARY KEY,
    discussion_id INTEGER REFERENCES discussions(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    unread_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_muted BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT NOW(),
    last_read_at TIMESTAMP,
    UNIQUE(discussion_id, user_id)
);

CREATE INDEX IF NOT EXISTS discussion_participants_discussion_id_idx ON discussion_participants(discussion_id);
CREATE INDEX IF NOT EXISTS discussion_participants_user_id_idx ON discussion_participants(user_id);

-- Modifier la table messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid() UNIQUE,
ADD COLUMN IF NOT EXISTS discussion_id INTEGER REFERENCES discussions(id),
ADD COLUMN IF NOT EXISTS sender_id INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reply_to_id INTEGER REFERENCES messages(id),
ADD COLUMN IF NOT EXISTS encrypted_content TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Modifier les types de colonnes existantes
ALTER TABLE messages 
ALTER COLUMN type TYPE VARCHAR(20);

-- Renommer la colonne timestamp en messages
ALTER TABLE messages RENAME COLUMN timestamp TO old_timestamp;

CREATE INDEX IF NOT EXISTS messages_discussion_id_idx ON messages(discussion_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
CREATE INDEX IF NOT EXISTS messages_type_idx ON messages(type);

-- Créer la table message_status
CREATE TABLE IF NOT EXISTS message_status (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    status VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS message_status_message_id_idx ON message_status(message_id);
CREATE INDEX IF NOT EXISTS message_status_user_id_idx ON message_status(user_id);
CREATE INDEX IF NOT EXISTS message_status_status_idx ON message_status(status);

-- Créer la table attachments
CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    message_id INTEGER REFERENCES messages(id) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    is_encrypted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS attachments_message_id_idx ON attachments(message_id);
CREATE INDEX IF NOT EXISTS attachments_mime_type_idx ON attachments(mime_type);

-- Modifier la table calls
ALTER TABLE calls 
ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid() UNIQUE,
ADD COLUMN IF NOT EXISTS discussion_id INTEGER REFERENCES discussions(id),
ADD COLUMN IF NOT EXISTS initiator_id INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS quality VARCHAR(20),
ADD COLUMN IF NOT EXISTS end_reason VARCHAR(50),
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Modifier les types de colonnes existantes
ALTER TABLE calls 
ALTER COLUMN type TYPE VARCHAR(20),
ALTER COLUMN status TYPE VARCHAR(20);

-- Renommer la colonne timestamp en calls
ALTER TABLE calls RENAME COLUMN timestamp TO old_timestamp;

CREATE INDEX IF NOT EXISTS calls_discussion_id_idx ON calls(discussion_id);
CREATE INDEX IF NOT EXISTS calls_initiator_id_idx ON calls(initiator_id);
CREATE INDEX IF NOT EXISTS calls_status_idx ON calls(status);
CREATE INDEX IF NOT EXISTS calls_created_at_idx ON calls(created_at);

-- Créer la table call_participants
CREATE TABLE IF NOT EXISTS call_participants (
    id SERIAL PRIMARY KEY,
    call_id INTEGER REFERENCES calls(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    UNIQUE(call_id, user_id)
);

CREATE INDEX IF NOT EXISTS call_participants_call_id_idx ON call_participants(call_id);
CREATE INDEX IF NOT EXISTS call_participants_user_id_idx ON call_participants(user_id);

-- Créer la table encryption_keys
CREATE TABLE IF NOT EXISTS encryption_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    key_type VARCHAR(20) NOT NULL,
    key_data TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS encryption_keys_user_id_idx ON encryption_keys(user_id);
CREATE INDEX IF NOT EXISTS encryption_keys_key_type_idx ON encryption_keys(key_type);

-- Créer la table audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_resource_type_idx ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at);

-- Créer la table notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at);

-- Migrer les données existantes si nécessaire
-- Mettre à jour discussion_id dans messages basé sur user_id (logique à adapter selon vos besoins)
-- UPDATE messages SET discussion_id = (SELECT id FROM discussions WHERE participant_id = messages.user_id LIMIT 1) WHERE discussion_id IS NULL;

-- Mettre à jour sender_id dans messages
UPDATE messages SET sender_id = user_id WHERE sender_id IS NULL;

-- Mettre à jour initiator_id dans calls
UPDATE calls SET initiator_id = caller_id WHERE initiator_id IS NULL;

-- Créer des discussions privées pour les anciens messages si nécessaire
-- Cette partie dépend de votre logique métier spécifique

COMMIT;

