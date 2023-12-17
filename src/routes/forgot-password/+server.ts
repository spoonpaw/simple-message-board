// src/routes/forgot-password/+server.ts

import type {RequestEvent} from '@sveltejs/kit';
import {pool} from '$lib/server';
import {sendEmail} from '$lib/server/email/sendEmail';
import { env } from '$env/dynamic/private';

export async function POST(requestEvent: RequestEvent) {
	const {userIdentifier} = await requestEvent.request.json();

	const client = await pool.connect();
	try {
		const userResult = await client.query(
			'SELECT id, email FROM users WHERE username = $1 OR email = $1',
			[userIdentifier]
		);

		if (userResult.rowCount === 0) {
			client.release();
			return new Response(JSON.stringify({error: 'User not found.'}), {status: 404});
		}

		const user = userResult.rows[0];

		// Update user with a new UUID as reset token and set its expiry
		const resetTokenResult = await client.query(
			`UPDATE users SET reset_token = uuid_generate_v4(), reset_token_expiry = NOW() + INTERVAL '1 HOUR' WHERE id = $1 RETURNING reset_token`,
			[user.id]
		);

		const resetToken = resetTokenResult.rows[0].reset_token;

		// Dynamically construct the reset link using the requestEvent URL
		const protocol = requestEvent.url.protocol;
		const host = requestEvent.url.host;
		const resetLink = `${protocol}//${host}/reset-password/${resetToken}`;

		await sendEmail({
			to: user.email,
			from: `no-reply@${env.SES_EMAIL_DOMAIN}`,
			subject: 'Password Reset',
			text: `Please use the following link to reset your password: ${resetLink}`,
			html: `<p>Please use the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`
		});

		client.release();
		return new Response(JSON.stringify({message: 'Password reset email sent.'}), {status: 200});

	} catch (error) {
		console.error('Error in password reset request:', error);
		client.release();
		return new Response(JSON.stringify({error: 'An error occurred.'}), {status: 500});
	}
}
