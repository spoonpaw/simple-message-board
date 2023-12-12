export type PostThreadView = {
	authorId: string;
	authorIsBanned: boolean;
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
	quotedPost?: PostThreadView | null;
	quotedPostId: string | null;
	updatedAt: string;
}
