// src/routes/thread/[id]/pin/+server.ts

import type {RequestEvent} from '@sveltejs/kit';
import {pool} from '$lib/server';
import {getPermissionsByUserId} from '$lib/server/db/queries/permissions/getPermissionsByUserId';
import {getThreadsByCategoryId} from '$lib/server/db/queries/threads/getThreadsByCategoryId';
import {validateUser} from "$lib/server/auth";

export async function PUT(requestEvent: RequestEvent) {
	const threadId = requestEvent.params.id;
	const requestData = await requestEvent.request.json();
	const pin = requestData.pin;
	let client;

	try {
		// Validate the user
		const user = await validateUser(requestEvent);
		if (!user) {
			return new Response(null, {status: 401}); // Unauthorized
		}

		// Check if the user has permission to pin threads
		const permissions = await getPermissionsByUserId(user.id);
		const canPinThread = permissions.some(p => p.name === 'pin_thread');
		if (!canPinThread) {
			return new Response(null, {status: 403}); // Forbidden
		}

		client = await pool.connect();

		// Update the thread's pinned state
		const pinResult = await client.query('UPDATE threads SET pinned = $1 WHERE id = $2', [pin, threadId]);
		if (pinResult.rowCount === 0) {
			client.release();
			return new Response(JSON.stringify({message: 'Thread not found'}), {
				status: 404,
				headers: {'Content-Type': 'application/json'}
			});
		}

		// Fetch the updated list of threads in the category
		const thread = await client.query('SELECT category_id FROM threads WHERE id = $1', [threadId]);
		const categoryId = thread.rows[0].category_id;
		const updatedThreads = await getThreadsByCategoryId(categoryId);

		client.release();
		return new Response(JSON.stringify(updatedThreads), {
			status: 200,
			headers: {'Content-Type': 'application/json'}
		});
	} catch (error) {
		console.error('Error updating thread pin state:', error);
		if (client) client.release();
		return new Response(null, {status: 500});
	}
}
