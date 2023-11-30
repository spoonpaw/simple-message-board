// src/routes/category/[slug]/$types.d.ts

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
	category_id: string;
	user_id: string | null;
	title: string;
	pinned: boolean;
	locked: boolean;
	created_at: Date;
    creator_username: string; // Username of the thread creator
    reply_count: number; // Number of replies to the thread
    last_replier_username: string | null; // Username of the last person who replied
}

// Define the PageServerData interface for this route
export interface PageServerData {
    username: string; // Username of the logged-in user
	category: Category;
	threads: Thread[];
}
