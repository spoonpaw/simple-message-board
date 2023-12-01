// src/routes/category/[id]/$types.d.ts

// Define the Category interface
export interface Category {
	id: string;
	title: string;
	description: string;
	created_at: Date;
	// Add any other category-specific properties if needed
}

// Define the Thread interface with additional fields
export interface Thread {
	id: string;
	categoryId: string;
	userId: string | null;
	title: string;
	pinned: boolean;
	locked: boolean;
	createdAt: Date;
	creatorUsername: string; // Username of the thread creator
	replyCount: number; // Number of replies to the thread
	lastReplierUsername: string | null; // Username of the last person who replied
	lastReplyAt: Date | null; // Date of the last reply
}

// Define the PageServerData interface for this route
export interface PageServerData {
	username: string; // Username of the logged-in user
	userid: string; // User ID of the logged-in user
	category: Category;
	threads: Thread[];
}
