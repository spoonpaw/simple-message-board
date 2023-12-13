-- migrations/seeds/001-initial-roles-and-permissions.sql

-- Insert default roles
INSERT INTO roles (name, hierarchy_level, is_default) VALUES
('Administrator', 1, false),
('Moderator', 2, false),
('User', 3, true);

-- Insert default permissions
INSERT INTO permissions (name, description) VALUES
    ('create_post', 'Can create posts'),
    ('edit_own_post', 'Can edit own posts'),
    ('delete_own_post', 'Can delete own posts'),
    ('edit_any_post', 'Can edit any post'),
    ('delete_any_post', 'Can delete any post'),
    ('pin_thread', 'Can pin threads'),
    ('lock_thread', 'Can lock threads'),
    ('delete_thread', 'Can delete threads'),
    ('access_admin_panel', 'Can access and use the admin panel'),
    ('modify_category', 'Can modify categories'),
    ('modify_roles', 'Can modify roles'),
    ('edit_post_lower_role', 'Can edit posts by users lower in the role hierarchy'),
    ('view_user_emails', 'Can view any user''s email address'),
    ('modify_role_permissions', 'Can modify role permissions'),
    ('assign_roles', 'Can assign roles to users'),
    ('delete_post_lower_role', 'Can delete posts by users lower in the role hierarchy'),
    ('create_category', 'Can create categories'),
    ('ban_user_lower_role', 'Can ban users lower in the role hierarchy'),
    ('delete_category', 'Can delete categories');

-- Associate permissions with roles
-- Giving 'Administrator' all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles, permissions
WHERE roles.name = 'Administrator';

-- Associate specific permissions with 'Moderator'
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Moderator' AND p.name IN (
    'ban_user_lower_role',
    'create_post',
    'delete_own_post',
    'delete_post_lower_role',
    'edit_own_post',
    'edit_post_lower_role'
);

-- Associate specific permissions with 'User'
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'User' AND p.name IN (
    'create_post',
    'delete_own_post',
    'edit_own_post'
);