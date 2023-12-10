// src/routes/thread/+server.ts

import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import { getThreadsByCategoryId, pool } from '$lib/server';
import { error, json } from '@sveltejs/kit';
import sanitizeHtml from 'sanitize-html';
import { getTextFromHtml } from '$lib/shared/htmlUtils/getTextFromHtml';

export async function POST(requestEvent: RequestEvent) {
	const authenticatedUser = await validateUser(requestEvent);
	if (!authenticatedUser) {
		return error(401, 'Unauthorized');
	}

	try {
		const requestData = await requestEvent.request.json();
		const { title, content, categoryId } = requestData;

		if (
			typeof title !== 'string' ||
			typeof content !== 'string' ||
			typeof categoryId !== 'string'
		) {
			return error(400, 'Title, content, and category ID are required');
		}

		// Validate title and content lengths
		if (title.length > 60) {
			return error(400, 'Title exceeds 60 characters.');
		}

		const textContent = getTextFromHtml(content);
		if (textContent.length > 8000) {
			return error(400, 'Content exceeds 8000 characters.');
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
			// Start a transaction
			await client.query('BEGIN');

			// Insert the new thread
			const threadInsertResult = await client.query(
				'INSERT INTO threads (category_id, user_id, title) VALUES ($1, $2, $3) RETURNING id',
				[categoryId, authenticatedUser.id, title]
			);
			const threadId = threadInsertResult.rows[0].id;

			// Insert the initial post in the thread with sanitized content
			await client.query('INSERT INTO posts (thread_id, user_id, content) VALUES ($1, $2, $3)', [
				threadId,
				authenticatedUser.id,
				sanitizedContent
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
	} catch (err) {
		console.error('Error parsing request JSON:', err);
		return error(400, 'Bad Request: Invalid JSON');
	}
}
