// src/routes/board/$types.d.ts

import type { Category } from '$lib/shared';

export interface PageServerData {
	username: string;
	userid: string;
	categories: Category[]; // Add this line to include categories
}
