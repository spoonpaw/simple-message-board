// src/routes/confirm/[token]/+page.server.ts

import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { pool } from '$lib/server';

export async function load(requestEvent: RequestEvent) {
	const { params } = requestEvent;
	const { token } = params;

	const client = await pool.connect();

	try {
		// Check if the token exists and is valid
		const userResult = await client.query('SELECT id, is_confirmed FROM users WHERE confirmation_token = $1', [token]);

		if (userResult.rowCount === 0) {
			client.release();
			throw error(404, 'Invalid or expired token');
		}

		const user = userResult.rows[0];
		if (user.is_confirmed) {
			client.release();
			throw error(400, 'Account already confirmed');
		}

		// Update user as confirmed
		await client.query('UPDATE users SET is_confirmed = TRUE WHERE id = $1', [user.id]);

		client.release();
		return { success: true };

	} catch (err) {
		client.release();
        return { error: 'Server error while confirming account' };
	}
}
