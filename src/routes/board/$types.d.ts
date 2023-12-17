// src/routes/board/$types.d.ts

import type {Category, Permission} from '$lib/shared';

export interface PageServerData {
	username: string;
	userid?: string;
	categories: Category[]; // Add this line to include categories
	permissions: Permission[];
	hasUnreadMessages: boolean;
}
