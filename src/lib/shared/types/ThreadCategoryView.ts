export type ThreadCategoryView = {
	id: string;
	categoryId: string;
	userId: string | null;
	title: string;
	pinned: boolean;
	locked: boolean;
	createdAt: string;
	creatorUsername: string;
	replyCount: number;
	lastReplierUsername: string | null;
	lastReplyAt: string | null;
};
