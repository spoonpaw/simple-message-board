// src/routes/change-email/[token]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { pool } from '$lib/server';

export async function load(requestEvent: RequestEvent) {
	const { params } = requestEvent;
	const { token } = params;

	const client = await pool.connect();

	try {
		// Check if the token exists and is valid
		const userResult = await client.query(
			'SELECT id, new_email FROM users WHERE email_change_token = $1 AND email_change_token_expiry > NOW()',
			[token]
		);

		if (userResult.rowCount === 0) {
			client.release();
			throw error(404, 'Invalid or expired email change token');
		}

		const user = userResult.rows[0];

		// Update user's email to the new email
		await client.query('UPDATE users SET email = $1, new_email = NULL, email_change_token = NULL, email_change_token_expiry = NULL WHERE id = $2', [user.new_email, user.id]);

		client.release();
		return { success: true };
	} catch (err) {
		client.release();
		return { error: 'Server error while processing email change' };
	}
}
