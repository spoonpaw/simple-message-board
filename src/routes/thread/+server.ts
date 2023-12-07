// src/routes/thread/+server.ts

import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import { getThreadsByCategoryId, pool } from '$lib/server';
import { error, json } from '@sveltejs/kit';

export async function POST(requestEvent: RequestEvent) {
	const authenticatedUser = await validateUser(requestEvent);
	if (!authenticatedUser) {
		return error(401, 'Unauthorized');
	}

	const formData = await requestEvent.request.formData();
	const title = formData.get('title');
	const content = formData.get('content');
	const categoryId = formData.get('categoryId');

	if (typeof title !== 'string' || typeof content !== 'string' || typeof categoryId !== 'string') {
		return error(400, 'Title, content, and category ID are required');
	}

	const client = await pool.connect();
	try {
		// Start a transaction
		await client.query('BEGIN');

		// Insert the new thread
		const threadInsertResult = await client.query(
			'INSERT INTO threads (category_id, user_id, title) VALUES ($1, $2, $3) RETURNING id',
			[categoryId, authenticatedUser.id, title]
		);
		const threadId = threadInsertResult.rows[0].id;

		// Insert the initial post in the thread
		await client.query('INSERT INTO posts (thread_id, user_id, content) VALUES ($1, $2, $3)', [
			threadId,
			authenticatedUser.id,
			content
		]);

		// Commit the transaction
		await client.query('COMMIT');

		// Fetch updated threads for the category to send back to the client
		const updatedThreads = await getThreadsByCategoryId(categoryId);

		return json(updatedThreads);
	} catch (err) {
		await client.query('ROLLBACK');
		console.error(err);
		return error(500, 'Server Error');
	} finally {
		client.release();
	}
}
