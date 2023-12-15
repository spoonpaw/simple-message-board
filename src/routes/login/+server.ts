// src/routes/login/+server.ts

import type {RequestEvent, RequestHandler} from '@sveltejs/kit';
import {pool} from '$lib/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {env} from '$env/dynamic/private';
import {dev} from '$app/environment';
import cookie from 'cookie';

export const POST: RequestHandler = async (requestEvent: RequestEvent) => {
	const {username, password} = await requestEvent.request.json();

	// Ensure the JWT_SECRET is defined
	const JWT_SECRET = env.JWT_SECRET;
	if (!JWT_SECRET) {
		throw new Error('JWT_SECRET is not defined. Please check your environment variables.');
	}

	// Start a new client connection from the pool
	const client = await pool.connect();

	try {
		// Check if the user exists and fetch the banned status
		const result = await client.query(
			'SELECT id, username, password_hash, banned, is_confirmed FROM users WHERE username = $1',
			[username]
		);

		if (result.rowCount === 0) {
			client.release();
			return new Response(JSON.stringify({error: 'Username does not exist.'}), {
				status: 404,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		// Extract user information
		const user = result.rows[0];

		// Check if the user is banned
		if (user.banned) {
			client.release();
			return new Response(JSON.stringify({error: 'User is banned.'}), {
				status: 403,
				headers: {'Content-Type': 'application/json'}
			});
		}

		// Check if the account is confirmed
		if (!user.is_confirmed) {
			client.release();
			return new Response(JSON.stringify({error: 'Account is not confirmed. Please check your email.'}), {
				status: 401,
				headers: {'Content-Type': 'application/json'}
			});
		}

		// Check if the password is correct
		const passwordIsValid = await bcrypt.compare(password, user.password_hash);

		if (!passwordIsValid) {
			client.release();
			return new Response(JSON.stringify({error: 'Invalid password.'}), {
				status: 401,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		// Update the last_login before issuing the JWT token
		await client.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

		// JWT token issuance
		const token = jwt.sign(
			{userId: user.id, username: user.username},
			JWT_SECRET,
			{expiresIn: '1h'} // Token expires in 1 hour
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
		return new Response(JSON.stringify({message: 'Login successful.'}), {
			status: 200,
			headers: {
				'Set-Cookie': serializedCookie
			}
		});
	} catch (error) {
		console.error('Database error:', error);
		client.release();
		return new Response(JSON.stringify({error: 'Failed to log in.'}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};
