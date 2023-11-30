// src/routes/category/[id]/+page.server.ts

import {error, redirect} from '@sveltejs/kit';
import type {RequestEvent} from '@sveltejs/kit';
import {validateUser} from '$lib/server/auth'; // Import the validateUser function
import {pool} from '$lib/server';
import type {PageServerData} from "./$types";

// Helper function to fetch threads for a category
async function fetchThreadsForCategory(categoryId: string) {
	const client = await pool.connect();
	try {
		const threadsResult = await client.query(`
			SELECT t.*, 
				   u.username as creator_username, 
				   GREATEST((SELECT COUNT(*) FROM posts WHERE thread_id = t.id) - 1, 0) as reply_count,
				   CASE 
					   WHEN (SELECT COUNT(*) FROM posts WHERE thread_id = t.id) > 1 THEN 
						   (SELECT username FROM users WHERE id = (SELECT user_id FROM posts WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1 OFFSET 1)) 
					   ELSE NULL
				   END as last_replier_username
			FROM threads t
			JOIN users u ON t.user_id = u.id
			WHERE t.category_id = $1
        `, [categoryId]);
		return threadsResult.rows.map(row => ({
			id: row.id,
			category_id: row.category_id,
			user_id: row.user_id,
			title: row.title,
			pinned: row.pinned,
			locked: row.locked,
			created_at: row.created_at,
			creator_username: row.creator_username,
			reply_count: row.reply_count,
			last_replier_username: row.last_replier_username
		}));
	} finally {
		client.release();
	}
}

export async function load(requestEvent: RequestEvent): Promise<PageServerData | { status: number, redirect: string }> {
	const {params} = requestEvent;

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
	const threads = await fetchThreadsForCategory(categoryId);

	client.release();

	return {
		username: authenticatedUser.username,
		category,
		threads
	};
}
