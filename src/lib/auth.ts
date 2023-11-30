import { error } from '@sveltejs/kit';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import { pool } from '$lib';
import type { RequestEvent } from '@sveltejs/kit';

export interface AuthenticatedUser {
	id: string;
	username: string;
}

export async function validateUser(requestEvent: RequestEvent): Promise<AuthenticatedUser | null> {
	console.log("Starting validateUser function.");

	const JWT_SECRET = env.JWT_SECRET as string;
	if (!JWT_SECRET) {
		console.error("JWT_SECRET is not defined.");
		throw error(500, 'JWT_SECRET is not defined.');
	}

	const cookieHeader = requestEvent.request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader || '');
	const token = cookies['token'];

	if (!token) {
		console.log("No token found in cookies, returning null.");
		return null;
	}

	try {
		console.log("Verifying JWT token.");
		const decodedToken = jwt.verify(token, JWT_SECRET);
		if (typeof decodedToken !== 'object' || decodedToken === null) {
			console.log("Invalid token, returning null.");
			return null;
		}

		const userId = decodedToken.userId as string;
		console.log(`Token valid, fetching user with ID: ${userId}`);

		const client = await pool.connect();
		try {
			const userResult = await client.query('SELECT id, username FROM users WHERE id = $1', [userId]);
			if (userResult.rowCount === 0) {
				console.log(`No user found for ID: ${userId}, returning null.`);
				return null;
			}
			console.log("User found, returning user data.");
			return userResult.rows[0];
		} finally {
			client.release();
		}
	} catch (err) {
		console.error("Error during token verification, returning null.", err);
		return null;
	}
}
