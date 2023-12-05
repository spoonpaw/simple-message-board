// src/routes/board/+page.server.ts

import type { RequestEvent } from '@sveltejs/kit';
import type { PageServerData } from './$types';
import { validateUser } from '$lib/server/auth'; // Import the validateUser function
import { pool } from '$lib/server';
import type { Category } from '$lib/shared';

async function fetchCategories(): Promise<Category[]> {
	try {
		console.log('Connecting to database to fetch categories.');
		const client = await pool.connect();
		const result = await client.query('SELECT * FROM categories');
		const categories = result.rows;
		client.release();

		return categories;
	} catch (error) {
		console.error('Error fetching categories:', error);
		return [];
	}
}

export async function load(requestEvent: RequestEvent): Promise<PageServerData> {
	console.log('Starting load function for board page.');

	const authenticatedUser = await validateUser(requestEvent);
	let username, userid;

	if (!authenticatedUser) {
		console.log('No authenticated user, viewing anonymously.');
		username = 'Anonymous';
		// userid is not set for anonymous users
	} else {
		console.log('User authenticated, fetching categories.');
		username = authenticatedUser.username;
		userid = authenticatedUser.id;
	}

	const categories = await fetchCategories();

	console.log('Returning data for board page.');
	return {
		username: username,
		userid: userid, // This can be undefined for anonymous users
		categories: categories
	};
}
