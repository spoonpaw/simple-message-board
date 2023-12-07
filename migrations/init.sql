-- migrations/init.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles Table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Permissions Table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);

-- Role Permissions Join Table
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    confirmation_token UUID DEFAULT uuid_generate_v4(),
    is_confirmed BOOLEAN DEFAULT FALSE,
    profile_image_url VARCHAR(255) DEFAULT 'https://simplemessageboard-images.s3.us-west-1.amazonaws.com/default_avatar.png',
    bio TEXT
);
-- Note: The role_id field in the users table is set to default to the 'User' role.
-- This default value should be set after roles are created using a separate query.

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Threads Table
CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    pinned BOOLEAN DEFAULT FALSE,
    locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Posts Table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    quoted_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Insert default roles
INSERT INTO roles (name) VALUES ('Administrator'), ('User');

-- Insert default permissions
INSERT INTO permissions (name, description) VALUES
    ('create_post', 'Can create posts'),
    ('edit_own_post', 'Can edit own posts'),
    ('delete_own_post', 'Can delete own posts'),
    ('edit_any_post', 'Can edit any post'),
    ('delete_any_post', 'Can delete any post'),
    ('pin_thread', 'Can pin threads'),
    ('lock_thread', 'Can lock threads');

-- Associate permissions with roles
-- Giving 'Administrator' all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles, permissions
WHERE roles.name = 'Administrator';

-- Giving 'User' basic permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles, permissions
WHERE roles.name = 'User' AND permissions.name IN ('create_post', 'edit_own_post', 'delete_own_post');
