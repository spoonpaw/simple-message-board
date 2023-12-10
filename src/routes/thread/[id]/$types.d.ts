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
	posts: PostView[];
}

export interface PostView {
	authorId: string;
	authorPostCount: number;
	authorProfileImageUrl: string;
	authorRoleName: string;
	authorUsername: string;
	content: string;
	createdAt: string;
	deleted: boolean;
	deletedAt: string | null;
	id: string;
	originatingPost: boolean;
	quotedPost?: PostView | null;
	quotedPostId: string | null;
	updatedAt: string;
}

export interface PageServerData {
	username: string;
	userid?: string;
	thread: ThreadView;
}
