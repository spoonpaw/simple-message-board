import type {RequestEvent} from '@sveltejs/kit';
import {pool} from '$lib/server';
import {sendEmail} from '$lib/server/email/sendEmail';
import {validateUser} from '$lib/server/auth'; // Import the validateUser function
import { env } from '$env/dynamic/private';

export async function POST(requestEvent: RequestEvent) {
	try {
		const {newEmail} = await requestEvent.request.json();
		const authenticatedUser = await validateUser(requestEvent);

		// Check if the user is authenticated and not banned
		if (!authenticatedUser) {
			return new Response(JSON.stringify({error: 'Unauthorized or banned user.'}), {status: 401});
		}

		const userId = authenticatedUser.id; // Use the ID from the validated user

		const client = await pool.connect();

		try {
			// Update user with a new UUID as email change token and set its expiry
			const emailChangeTokenResult = await client.query(
				`UPDATE users SET new_email = $1, email_change_token = uuid_generate_v4(), email_change_token_expiry = NOW() + INTERVAL '1 HOUR' WHERE id = $2 RETURNING email_change_token`,
				[newEmail, userId]
			);

			const emailChangeToken = emailChangeTokenResult.rows[0].email_change_token;

			// Construct the confirmation link
			const protocol = requestEvent.url.protocol;
			const host = requestEvent.url.host;
			const confirmationLink = `${protocol}//${host}/change-email/${emailChangeToken}`;

			// Send the confirmation email
			await sendEmail({
				to: newEmail,
                from: `no-reply@${env.SES_EMAIL_DOMAIN}`,
				subject: 'Confirm Your Email Change',
				text: `Please use the following link to confirm your email change: ${confirmationLink}`,
				html: `<p>Please use the following link to confirm your email change: <a href="${confirmationLink}">${confirmationLink}</a></p>`
			});

			client.release();
			return new Response(JSON.stringify({message: 'Confirmation email sent to the new address.'}), {status: 200});
		} catch (error) {
			console.error('Error processing email change:', error);
			client.release();
			return new Response(JSON.stringify({error: 'An error occurred while processing the email change.'}), {status: 500});
		}
	} catch (error) {
		console.error('Error in request processing:', error);
		return new Response(JSON.stringify({error: 'Invalid request data.'}), {status: 400});
	}
}
