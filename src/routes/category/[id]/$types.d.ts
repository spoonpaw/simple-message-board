// src/routes/category/[id]/$types.d.ts

// Define the Category interface
import type { Category, ThreadCategoryView } from '$lib/shared';

// Define the PageServerData interface for this route
export interface PageServerData {
	username: string; // Username of the logged-in user
	userid?: string; // User ID of the logged-in user
	category: Category;
	threads: ThreadCategoryView[];
}
