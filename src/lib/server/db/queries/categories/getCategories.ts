// src/lib/server/db/queries/categories/getCategories.ts

import type {Category} from "$lib/shared";
import {pool} from "$lib/server";

export async function getCategories(): Promise<Category[]> {
	try {
		console.log('Connecting to database to fetch categories.');
		const client = await pool.connect();
		const result = await client.query('SELECT * FROM categories WHERE is_deleted = FALSE');
		const categories = result.rows;
		client.release();

		return categories;
	} catch (error) {
		console.error('Error fetching categories:', error);
		return [];
	}
}
