// src/routes/category/[id]/+page.server.ts

import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth'; // Import the validateUser function
import type { PageServerData } from './$types';
import { getThreadsByCategoryId, pool } from '$lib/server';

// Helper function to fetch threads for a category

export async function load(
	requestEvent: RequestEvent
): Promise<PageServerData | { status: number; redirect: string }> {
	const { params } = requestEvent;

	const authenticatedUser = await validateUser(requestEvent);

	// Handle redirection for unauthenticated users
	if (!authenticatedUser) {
		throw redirect(302, '/'); // Redirect to the login page or any other page as needed
	}

	const categoryId = params.id;
	if (!categoryId) {
		throw error(400, 'Category ID is required');
	}

	const client = await pool.connect();

	// Fetch category information
	const categoryResult = await client.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
	const category = categoryResult.rows[0];
	if (!category) {
		client.release();
		throw error(404, 'Category not found');
	}

	// Use helper function to fetch threads
	const threads = await getThreadsByCategoryId(categoryId);

	client.release();

	return {
		username: authenticatedUser.username,
		userid: authenticatedUser.id,
		category,
		threads
	};
}
