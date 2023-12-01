// src/routes/thread/[id]/$types.d.ts

export interface Thread {
	id: string;
	category_id: string;
	user_id: string | null;
	title: string;
	pinned: boolean;
	locked: boolean;
	created_at: string;
	creator_username: string;
	category_title: string;
	posts: Post[];
}

export interface Post {
	id: string;
	thread_id: string;
	user_id: string | null;
	content: string;
	quoted_post_id: string | null;
	createdAt: string;
	updatedAt: string;
	authorUsername: string;
	authorId: string;
}

export interface PageServerData {
	username: string;
	userid: string;
	thread: Thread;
}
