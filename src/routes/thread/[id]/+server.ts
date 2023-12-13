// src/routes/thread/[id]/+server.ts

import type {RequestEvent} from '@sveltejs/kit';
import {pool} from '$lib/server';
import {validateUser} from '$lib/server/auth';
import {getThreadsByCategoryId} from '$lib/server/db/queries/threads/getThreadsByCategoryId';
import {getPermissionsByUserId} from "$lib/server/db/queries/permissions/getPermissionsByUserId";

export async function DELETE(requestEvent: RequestEvent) {
	const threadId = requestEvent.params.id;

	let client;

	try {
		// Validate the user
		const user = await validateUser(requestEvent);
		if (!user) {
			return new Response(null, {status: 401}); // Unauthorized
		}

		// Check if the user has permission to delete threads
		const permissions = await getPermissionsByUserId(user.id);
		const canDeleteThread = permissions.some(p => p.name === 'delete_thread');
		if (!canDeleteThread) {
			return new Response(null, {status: 403}); // Forbidden
		}

		client = await pool.connect();

		// Soft delete the thread
		const deleteResult = await client.query('UPDATE threads SET is_deleted = TRUE WHERE id = $1', [threadId]);
		if (deleteResult.rowCount === 0) {
			return new Response(JSON.stringify({message: 'Thread not found or already deleted'}), {
				status: 404,
				headers: {'Content-Type': 'application/json'}
			});
		}

		// Fetch the category ID of the thread
		const thread = await client.query('SELECT category_id FROM threads WHERE id = $1', [threadId]);
		const categoryId = thread.rows[0].category_id;

		// Fetch the updated list of threads in the category
		const updatedThreads = await getThreadsByCategoryId(categoryId);

		client.release();
		return new Response(JSON.stringify(updatedThreads), {
			status: 200,
			headers: {'Content-Type': 'application/json'}
		});
	} catch (error) {
		if (client) client.release();
		return new Response(null, {status: 500});
	}
}
