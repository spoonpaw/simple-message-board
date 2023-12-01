// src/routes/post/+server.ts

import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import { getPostsByThreadId, pool } from '$lib/server';
import { error, json } from '@sveltejs/kit';

export async function POST(requestEvent: RequestEvent) {
	const { request } = requestEvent;
	const authenticatedUser = await validateUser(requestEvent);
	if (!authenticatedUser) {
		return error(401, 'Unauthorized');
	}

	const formData = await request.formData();
	const threadId = formData.get('threadId');
	const content = formData.get('content');

	if (typeof threadId !== 'string' || typeof content !== 'string' || !content.trim()) {
		return error(400, 'Thread ID and content are required');
	}

	const client = await pool.connect();
	try {
		// Check if the thread is locked
		const threadResult = await client.query('SELECT locked FROM threads WHERE id = $1', [threadId]);
		if (threadResult.rows.length === 0) {
			return error(404, 'Thread not found');
		}
		if (threadResult.rows[0].locked) {
			return error(403, 'Thread is locked');
		}

		// Insert the new post
		await client.query('INSERT INTO posts (thread_id, user_id, content) VALUES ($1, $2, $3)', [
			threadId,
			authenticatedUser.id,
			content
		]);

		// Fetch updated posts after the insertion
		const updatedPosts = await getPostsByThreadId(threadId);

		return json(updatedPosts);
	} catch (err) {
		console.error(err);
		return error(500, 'Server Error');
	} finally {
		client.release();
	}
}
