// src/routes/post/[id]/+server.ts

import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import { getPostsByThreadId, pool } from '$lib/server';
import { error, json } from '@sveltejs/kit';
import sanitizeHtml from 'sanitize-html';
import { getTextFromHtml } from '$lib/shared/htmlUtils/getTextFromHtml';

export async function PUT(requestEvent: RequestEvent) {
	const { params, request } = requestEvent;
	const authenticatedUser = await validateUser(requestEvent);
	if (!authenticatedUser) {
		return error(401, 'Unauthorized');
	}

	const postId = params.id;

	try {
		const requestData = await request.json();
		const { threadId, content, title } = requestData;

		if (getTextFromHtml(content).length > 8000) {
			return error(400, 'Content exceeds 8000 characters.');
		}

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
			await client.query('BEGIN'); // Start transaction

			const threadResult = await client.query('SELECT locked FROM threads WHERE id = $1', [
				threadId
			]);
			if (threadResult.rows.length === 0) {
				await client.query('ROLLBACK'); // Rollback transaction
				return error(404, 'Thread not found');
			}
			if (threadResult.rows[0].locked) {
				await client.query('ROLLBACK'); // Rollback transaction
				return error(403, 'Thread is locked');
			}

			const updateResult = await client.query(
				'UPDATE posts SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
				[sanitizedContent, postId, authenticatedUser.id]
			);

			if (updateResult.rowCount === 0) {
				await client.query('ROLLBACK'); // Rollback transaction
				return error(404, 'Post not found or user is not the creator of the post');
			}

			const originatingPostQuery = await client.query(
				'SELECT id FROM posts WHERE thread_id = $1 ORDER BY created_at ASC LIMIT 1',
				[threadId]
			);
			const isOriginatingPost = originatingPostQuery.rows[0].id === postId;

			if (isOriginatingPost && title) {
				if (title.length > 60) {
					await client.query('ROLLBACK'); // Rollback transaction
					return error(400, 'Title exceeds 60 characters.');
				}
				await client.query('UPDATE threads SET title = $1 WHERE id = $2', [title, threadId]);
			}

			await client.query('COMMIT'); // Commit transaction

			const updatedPosts = await getPostsByThreadId(threadId);
			const response = {
				posts: updatedPosts,
				updatedThreadTitle: isOriginatingPost && title ? title : null
			};

			return json(response);
		} catch (err) {
			await client.query('ROLLBACK'); // Rollback transaction
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

		// Mark the post as deleted instead of deleting it
		const deleteResult = await client.query(
			'UPDATE posts SET deleted = TRUE, deleted_at = NOW() WHERE id = $1 AND user_id = $2',
			[postId, authenticatedUser.id]
		);

		// Check if the post was actually updated
		if (deleteResult.rowCount === 0) {
			return error(404, 'Post not found or user is not the creator of the post');
		}

		// Fetch updated posts after marking as deleted
		const updatedPosts = await getPostsByThreadId(threadId);

		return json(updatedPosts);
	} catch (err) {
		console.error(err);
		return error(500, 'Server Error');
	} finally {
		client.release();
	}
}
