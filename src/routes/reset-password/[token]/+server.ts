// src/routes/reset-password/[token]/+server.ts
import {json} from '@sveltejs/kit';
import type {RequestEvent} from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import {pool} from '$lib/server';

export async function POST(requestEvent: RequestEvent) {
	const {params, request} = requestEvent;
	const {token} = params;
	const {newPassword} = await request.json();

	const client = await pool.connect();
	try {
		// Verify the token and get the user's ID
		const tokenVerification = await client.query(
			'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
			[token]
		);

		if (tokenVerification.rowCount === 0) {
			client.release();
			return json({error: 'Invalid or expired token'}, {status: 400});
		}

		const userId = tokenVerification.rows[0].id;

		// Hash the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update the user's password and clear the reset token
		await client.query(
			'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
			[hashedPassword, userId]
		);

		client.release();
		return json({message: 'Password successfully reset'}, {status: 200});

	} catch (err) {
		console.error('Error in reset password request:', err);
		client.release();
		return json({error: 'An error occurred while resetting the password'}, {status: 500});
	}
}
