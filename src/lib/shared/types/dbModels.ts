// src/lib/db/types/dbModels.ts

export interface User {
	id: string;
	username: string;
	email: string;
	password_hash: string;
	role_id: string; // Non-nullable role ID
	created_at: Date;
	last_login: Date | null;
	confirmation_token: string;
	is_confirmed: boolean;
	profile_image_url: string;
	bio?: string; // Optional bio field
	banned: boolean;
	reset_token: string | null;
	reset_token_expiry: Date | null;
	new_email: string | null;
	email_change_token: string | null;
	email_change_token_expiry: Date | null;
}

export interface Role {
	id: string;
	name: string;
    hierarchy_level: number; // Include hierarchy_level according to the database structure
	is_default: boolean;
}

export interface Permission {
	id: string;
	name: string;
	description: string;
}

export interface RolePermission {
	role_id: string;
	permission_id: string;
}

export interface Category {
	id: string;
	title: string;
	description: string;
	created_at: Date;
}

export interface Thread {
	id: string;
	category_id: string;
	user_id: string | null;
	title: string;
	pinned: boolean;
	locked: boolean;
	created_at: Date;
	is_deleted: boolean;
}

export interface Post {
	id: string;
	thread_id: string;
	user_id: string | null;
	content: string;
	quoted_post_id: string | null;
	created_at: Date;
	updated_at: Date | null;
	deleted: boolean;
    deleted_at?: Date; // Add deleted_at field for posts
}

export interface PrivateMessage {
	id: string;
	sender_id: string;
	recipient_id: string;
	subject: string;
	content: string;
	sent_at: Date;
	read_at: Date;
	is_deleted_sender: boolean;
	is_deleted_recipient: boolean;
}
