// src/routes/post/[id]/+server.ts

import type {RequestEvent} from '@sveltejs/kit';
import {validateUser} from '$lib/server/auth';
import {getPostsByThreadId, pool} from '$lib/server';
import {error, json} from '@sveltejs/kit';
import sanitizeHtml from 'sanitize-html';
import {getTextFromHtml} from '$lib/shared/htmlUtils/getTextFromHtml';
import {getUserPermissionsByUserId} from "$lib/server/db/queries/permissions/getPermissionsByUserId";

export async function PUT(requestEvent: RequestEvent) {
	const {params, request} = requestEvent;
	const authenticatedUser = await validateUser(requestEvent);
	if (!authenticatedUser) {
		return error(401, 'Unauthorized');
	}

	const postId = params.id;
	const requestData = await request.json();
	const {threadId, content, title} = requestData;

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
		// Check user permissions
		const permissions = await getUserPermissionsByUserId(authenticatedUser.id);
		const canEditAnyPost = permissions.some(p => p.name === 'edit_any_post');

		await client.query('BEGIN'); // Start transaction

		// Check if the thread is locked
		const threadResult = await client.query('SELECT locked FROM threads WHERE id = $1', [
			threadId
		]);
		if (threadResult.rows.length === 0) {
			await client.query('ROLLBACK'); // Rollback transaction
			return error(404, 'Thread not found');
		}
		if (threadResult.rows[0].locked && !canEditAnyPost) {
			await client.query('ROLLBACK'); // Rollback transaction
			return error(403, 'Thread is locked');
		}

		// Update the post
		const updateQuery = canEditAnyPost
			? 'UPDATE posts SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *'
			: 'UPDATE posts SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *';
		const updateValues = canEditAnyPost ? [sanitizedContent, postId] : [sanitizedContent, postId, authenticatedUser.id];
		const updateResult = await client.query(updateQuery, updateValues);

		if (updateResult.rowCount === 0) {
			await client.query('ROLLBACK'); // Rollback transaction
			return error(404, 'Post not found or user does not have permission to edit this post');
		}

		// Handle updating the thread title if it's the originating post
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
}

export async function DELETE(requestEvent: RequestEvent) {
	const {params, request} = requestEvent;
	const authenticatedUser = await validateUser(requestEvent);
	if (!authenticatedUser) {
		return error(401, 'Unauthorized');
	}

	const postId = params.id;
	const {threadId} = await request.json(); // Retrieve the thread ID from the request body

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

		// Check if the user has permission to delete any post
		const permissions = await getUserPermissionsByUserId(authenticatedUser.id);
		const canDeleteAnyPost = permissions.some(p => p.name === 'delete_any_post');

		let deleteResult;
		if (canDeleteAnyPost) {
			// User has permission to delete any post
			deleteResult = await client.query(
				'UPDATE posts SET deleted = TRUE, deleted_at = NOW() WHERE id = $1',
				[postId]
			);
		} else {
			// User can only delete their own post
			deleteResult = await client.query(
				'UPDATE posts SET deleted = TRUE, deleted_at = NOW() WHERE id = $1 AND user_id = $2',
				[postId, authenticatedUser.id]
			);
		}

		if (deleteResult.rowCount === 0) {
			return error(404, 'Post not found or user does not have permission to delete this post');
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
