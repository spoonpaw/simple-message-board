// src/routes/reset-password/[token]/+page.server.ts

import {error} from '@sveltejs/kit';
import type {RequestEvent} from '@sveltejs/kit';
import {pool} from '$lib/server';

export async function load(requestEvent: RequestEvent) {
	const {params} = requestEvent;
	const {token} = params;

	const client = await pool.connect();

	try {
		// Check if the token exists and is valid
		const userResult = await client.query('SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()', [token]);

		if (userResult.rowCount === 0) {
			throw error(404, 'Invalid or expired token');
		}

		return {success: true, token: token};

	} catch (err) {
		// Handle the error, but don't release the client here
		return {error: 'Server error while processing password reset request'};
	} finally {
		// Release the client in the finally block, ensuring it's only called once
		client.release();
	}
}
