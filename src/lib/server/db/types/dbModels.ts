// src/lib/db/types/dbModels.ts

export interface User {
	id: string;
	username: string;
	email: string;
	password_hash: string;
	created_at: Date;
	last_login: Date | null;
	confirmation_token: string;
	is_confirmed: boolean;
}

export interface Category {
	id: string;
	title: string;
	description: string | null;
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
}

export interface Post {
	id: string;
	thread_id: string;
	user_id: string | null;
	content: string;
	quoted_post_id: string | null;
	created_at: Date;
	updated_at: Date | null;
}
