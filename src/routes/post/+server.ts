// src/routes/post/+server.ts

import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import { getPostsByThreadId, pool } from '$lib/server';
import { error, json } from '@sveltejs/kit';
import sanitizeHtml from 'sanitize-html';

export async function POST(requestEvent: RequestEvent) {
	const authenticatedUser = await validateUser(requestEvent);
	if (!authenticatedUser) {
		return error(401, 'Unauthorized');
	}

	// Parse JSON data from the request body
	const requestData = await requestEvent.request.json();
	const { threadId, content } = requestData;

	if (!threadId || typeof content !== 'string' || !content.trim()) {
		return error(400, 'Thread ID and content are required');
	}

	// Sanitize the content
	const sanitizedContent = sanitizeHtml(content, {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			img: ['src', 'alt', 'title', 'width', 'height']
		},
		allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel']
	});

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

		// Insert the new post with sanitized content
		await client.query('INSERT INTO posts (thread_id, user_id, content) VALUES ($1, $2, $3)', [
			threadId,
			authenticatedUser.id,
			sanitizedContent
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
