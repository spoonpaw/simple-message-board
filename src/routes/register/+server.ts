// src/routes/register/+server.ts

import type {RequestEvent, RequestHandler} from '@sveltejs/kit';
import {pool} from '$lib/server';
import bcrypt from 'bcrypt';
import validator from 'validator';
import {sendEmail} from "$lib/server/email/sendEmail";
import {env} from '$env/dynamic/private';

export const POST: RequestHandler = async (requestEvent: RequestEvent) => {
	const {username, email, password} = await requestEvent.request.json();

	// Validate email address format
	if (!validator.isEmail(email)) {
		return new Response(JSON.stringify({error: 'Invalid email address.'}), {
			status: 400,
			headers: {'Content-Type': 'application/json'}
		});
	}

	// Validate username length
	if (username.length < 3 || username.length > 20) {
		return new Response(JSON.stringify({error: 'Username must be between 3 and 20 characters.'}), {
			status: 400,
			headers: {'Content-Type': 'application/json'}
		});
	}

	// Validate password length
	if (password.length < 8 || password.length > 64) {
		return new Response(JSON.stringify({error: 'Password must be between 8 and 64 characters.'}), {
			status: 400,
			headers: {'Content-Type': 'application/json'}
		});
	}

	// Start a new client connection from the pool
	const client = await pool.connect();
	await client.query('BEGIN'); // Start transaction

	try {
		// Check if email/username exists
		const userExists = await client.query('SELECT 1 FROM users WHERE email = $1 OR username = $2', [
			email,
			username
		]);

		const userExistsRowCount = userExists.rowCount ?? 0;

		if (userExistsRowCount > 0) {
			await client.query('ROLLBACK'); // Rollback transaction
			client.release();
			return new Response(JSON.stringify({error: 'Username or email already exists.'}), {
				status: 409,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		// Hash the password
		const passwordHash = await bcrypt.hash(password, 10);

		// Find the default role
		const defaultRoleResult = await client.query('SELECT id FROM roles WHERE is_default = TRUE');
		let roleId;

		if ((defaultRoleResult.rowCount ?? 0) > 0) {
			roleId = defaultRoleResult.rows[0].id;
		} else {
			await client.query('ROLLBACK');
			client.release();
			return new Response(JSON.stringify({error: 'No default role set in the system.'}), {
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		// Insert the new user into the database
		const insertResult = await client.query(
			'INSERT INTO users (username, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING id, username, confirmation_token',
			[username, email, passwordHash, roleId]
		);
		const newUser = insertResult.rows[0];

		// Construct the confirmation link
		const protocol = requestEvent.url.protocol;
		const host = requestEvent.url.host;
		const confirmationLink = `${protocol}//${host}/confirm/${newUser.confirmation_token}`;

		try {
			await sendEmail({
				from: `no-reply@${env.SES_EMAIL_DOMAIN}`,
				to: email,
				subject: 'Confirm your Net Artisan Collective Account',
				text: `Please confirm your account by clicking on this link: ${confirmationLink}`,
				html: `<p>Please confirm your account by clicking on this link: <a href="${confirmationLink}">${confirmationLink}</a></p>`
			});
		} catch (emailError) {
			console.error('Email sending error:', emailError);
			await client.query('ROLLBACK'); // Rollback if email sending fails
			client.release();
			return new Response(JSON.stringify({error: 'Failed to send confirmation email.'}), {
				status: 500,
				headers: {'Content-Type': 'application/json'}
			});
		}

		await client.query('COMMIT'); // Commit transaction
		client.release();
		return new Response(JSON.stringify({message: 'Registration successful! Please check your email to confirm your account.'}), {
			status: 201,
			headers: {'Content-Type': 'application/json'}
		});

	} catch (error) {
		console.error('Database error:', error);
		await client.query('ROLLBACK');
		client.release();
		return new Response(JSON.stringify({error: 'Failed to create user.'}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};
