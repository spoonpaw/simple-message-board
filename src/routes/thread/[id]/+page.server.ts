// src/routes/thread/[id]/+page.server.ts

import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import { pool } from '$lib/server';

async function fetchThreadById(threadId: string) {
	const client = await pool.connect();
	try {
		// Fetch the thread details
		const threadResult = await client.query(`
            SELECT t.*, 
                   u.username as creator_username,
                   c.title as category_title
            FROM threads t
            JOIN users u ON t.user_id = u.id
            JOIN categories c ON t.category_id = c.id
            WHERE t.id = $1
        `, [threadId]);

		if (threadResult.rows.length === 0) {
			return null;
		}

		const thread = threadResult.rows[0];

		// Fetch posts for the thread
		const postsResult = await client.query(`
            SELECT p.*, 
                   u.username as author_username
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.thread_id = $1
            ORDER BY p.created_at ASC
        `, [threadId]);

		return {
			...thread,
			posts: postsResult.rows.map(row => ({
				id: row.id,
				content: row.content,
				authorUsername: row.author_username,
				quotedPostId: row.quoted_post_id,
				createdAt: row.created_at,
				updatedAt: row.updated_at
			}))
		};
	} finally {
		client.release();
	}
}

export async function load(requestEvent: RequestEvent) {
	const { params } = requestEvent;

	const authenticatedUser = await validateUser(requestEvent);
	if (!authenticatedUser) {
		throw redirect(302, '/');
	}

	const threadId = params.id;
	if (!threadId) {
		throw error(400, 'Thread ID is required');
	}

	const threadDetails = await fetchThreadById(threadId);
	if (!threadDetails) {
		throw error(404, 'Thread not found');
	}

	return {
		username: authenticatedUser.username,
		thread: threadDetails
	};
}
