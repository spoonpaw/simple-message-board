// src/routes/register/+server.ts

import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import { pool } from '$lib/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import cookie from 'cookie';
import validator from 'validator';

export const POST: RequestHandler = async (requestEvent: RequestEvent) => {
	const { username, email, password } = await requestEvent.request.json();

	// Validate email address format
	if (!validator.isEmail(email)) {
		return new Response(JSON.stringify({ error: 'Invalid email address.' }), {
			status: 400,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	// Start a new client connection from the pool
	const client = await pool.connect();

	try {
		// Check if email/username exists
		const userExists = await client.query('SELECT 1 FROM users WHERE email = $1 OR username = $2', [
			email,
			username
		]);

		const userExistsRowCount = userExists.rowCount ?? 0;

		if (userExistsRowCount > 0) {
			client.release();
			return new Response(JSON.stringify({ error: 'Username or email already exists.' }), {
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
			// Handle the case where no default role is found
			// Option 1: Set a specific fallback role ID
			// roleId = 'your-fallback-role-id';

			// Option 2: Abort registration with an error message
			client.release();
			return new Response(JSON.stringify({ error: 'No default role set in the system.' }), {
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		// Insert the new user into the database with the determined role
		const insertResult = await client.query(
			'INSERT INTO users (username, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING id, username',
			[username, email, passwordHash, roleId]
		);
		const newUser = insertResult.rows[0];

		// Immediately log in the user by generating a JWT token
		const JWT_SECRET = env.JWT_SECRET || 'your-secret-should-not-be-here';
		const token = jwt.sign(
			{ userId: newUser.id, username: newUser.username },
			JWT_SECRET,
			{ expiresIn: '1h' } // Token expires in 1 hour
		);

		// Set the httpOnly cookie
		const serializedCookie = cookie.serialize('token', token, {
			httpOnly: true,
			maxAge: 60 * 60, // 1 hour
			path: '/',
			sameSite: 'strict',
			secure: !dev // Use secure cookies in production
		});

		client.release();
		return new Response(JSON.stringify({ message: 'User created successfully.', user: newUser }), {
			status: 201,
			headers: {
				'Content-Type': 'application/json',
				'Set-Cookie': serializedCookie
			}
		});
	} catch (error) {
		console.error('Database error:', error);
		client.release();
		return new Response(JSON.stringify({ error: 'Failed to create user.' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};
