// src/routes/user/bio/+server.ts

import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { pool } from '$lib/server';
import { validateUser } from '$lib/server/auth';

export const POST: RequestHandler = async (requestEvent: RequestEvent) => {
	// Authenticate the user
	const authenticatedUser = await validateUser(requestEvent);
	if (!authenticatedUser) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	const { bio } = await requestEvent.request.json();
	if (typeof bio !== 'string') {
		return new Response(JSON.stringify({ error: 'Invalid bio format' }), {
			status: 400,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	// Update the bio in the database
	const client = await pool.connect();
	try {
		await client.query('UPDATE users SET bio = $1 WHERE id = $2', [bio, authenticatedUser.id]);
		return new Response(JSON.stringify({ bio }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('Database error:', error);
		return new Response(JSON.stringify({ error: 'Failed to update bio' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} finally {
		client.release();
	}
};
