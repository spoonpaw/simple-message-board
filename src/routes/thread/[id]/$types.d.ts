// src/routes/thread/[id]/$types.d.ts

export interface ThreadView {
	id: string;
	category_id: string;
	user_id: string | null;
	title: string;
	pinned: boolean;
	locked: boolean;
	created_at: string;
	creator_username: string;
	category_title: string;
	posts: PostThreadView[];
}

export interface PageServerData {
	username: string;
	userid?: string;
	permissions: Permission[];
	thread: ThreadView;
	hasUnreadMessages: boolean;
}
