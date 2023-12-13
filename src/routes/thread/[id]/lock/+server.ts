// src/routes/thread/[id]/lock/+server.ts

import type {RequestEvent} from '@sveltejs/kit';
import {pool} from '$lib/server';
import {getPermissionsByUserId} from '$lib/server/db/queries/permissions/getPermissionsByUserId';
import {getThreadsByCategoryId} from '$lib/server/db/queries/threads/getThreadsByCategoryId';
import {validateUser} from "$lib/server/auth";

export async function PUT(requestEvent: RequestEvent) {
	const threadId = requestEvent.params.id;
	const requestData = await requestEvent.request.json();
	const lock = requestData.lock;
	let client;

	try {
		// Validate the user
		const user = await validateUser(requestEvent);
		if (!user) {
			return new Response(null, {status: 401}); // Unauthorized
		}

		// Check if the user has permission to lock threads
		const permissions = await getPermissionsByUserId(user.id);
		const canLockThread = permissions.some(p => p.name === 'lock_thread');
		if (!canLockThread) {
			return new Response(null, {status: 403}); // Forbidden
		}

		client = await pool.connect();

		// Update the thread's locked state
		const lockResult = await client.query('UPDATE threads SET locked = $1 WHERE id = $2', [lock, threadId]);
		if (lockResult.rowCount === 0) {
			client.release();
			return new Response(JSON.stringify({message: 'Thread not found'}), {
				status: 404,
				headers: {'Content-Type': 'application/json'}
			});
		}

		// Assuming thread has a category_id field to link it to its category
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
		console.error('Error updating thread lock state:', error);
		if (client) client.release();
		return new Response(null, {status: 500});
	}
}
