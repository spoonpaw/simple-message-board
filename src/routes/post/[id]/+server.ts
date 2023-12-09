// src/routes/post/[id]/+server.ts

import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import { getPostsByThreadId, pool } from '$lib/server';
import { error, json } from '@sveltejs/kit';
import sanitizeHtml from 'sanitize-html';

export async function PUT(requestEvent: RequestEvent) {
	const { params, request } = requestEvent;
	const authenticatedUser = await validateUser(requestEvent);
	if (!authenticatedUser) {
		return error(401, 'Unauthorized');
	}

	const postId = params.id;

	try {
		const requestData = await request.json();
		const threadId = requestData.threadId;
		let content = requestData.content;

		// Sanitize the content
		content = sanitizeHtml(content, {
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
			const threadResult = await client.query('SELECT locked FROM threads WHERE id = $1', [
				threadId
			]);
			if (threadResult.rows.length === 0) {
				return error(404, 'Thread not found');
			}
			if (threadResult.rows[0].locked) {
				return error(403, 'Thread is locked');
			}

			// Update the post with sanitized content
			const updateResult = await client.query(
				'UPDATE posts SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
				[content, postId, authenticatedUser.id]
			);

			// Check if the post was actually updated
			if (updateResult.rowCount === 0) {
				return error(404, 'Post not found or user is not the creator of the post');
			}

			// Fetch updated posts after the edit
			const updatedPosts = await getPostsByThreadId(threadId);

			return json(updatedPosts);
		} catch (err) {
			console.error('Error processing PUT request:', err);
			return error(500, 'Server Error');
		} finally {
			client.release();
		}
	} catch (err) {
		console.error('Error processing PUT request:', err);
		return error(500, 'Server Error');
	}
}

export async function DELETE(requestEvent: RequestEvent) {
	const { params, request } = requestEvent;
	const authenticatedUser = await validateUser(requestEvent);
	if (!authenticatedUser) {
		return error(401, 'Unauthorized');
	}

	const postId = params.id;
	const { threadId } = await request.json(); // Retrieve the thread ID from the request body

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

		// Delete the post
		const deleteResult = await client.query('DELETE FROM posts WHERE id = $1 AND user_id = $2', [
			postId,
			authenticatedUser.id
		]);

		// Check if the post was actually deleted
		if (deleteResult.rowCount === 0) {
			return error(404, 'Post not found or user is not the creator of the post');
		}

		// Fetch updated posts after deletion
		const updatedPosts = await getPostsByThreadId(threadId);

		return json(updatedPosts);
	} catch (err) {
		console.error(err);
		return error(500, 'Server Error');
	} finally {
		client.release();
	}
}
