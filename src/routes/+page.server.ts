// src/routes/+page.server.ts

import { error } from '@sveltejs/kit';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { pool } from '$lib'; // Make sure to import your configured pool from wherever you have it
import { env } from '$env/dynamic/private';
import type { PageServerData } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

export async function load({ request }: RequestEvent): Promise<PageServerData> {
	const JWT_SECRET = env.JWT_SECRET as string;
	if (!JWT_SECRET) {
		throw error(500, 'JWT_SECRET is not defined.');
	}

	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader || '');
	const token = cookies['token'];

	if (token) {
		try {
			const decodedToken = jwt.verify(token, JWT_SECRET);
			if (typeof decodedToken !== 'object' || decodedToken === null) {
				throw new Error('Invalid token');
			}

            // Connect to the database and check if the user still exists
            const client = await pool.connect();
            try {
                const userResult = await client.query('SELECT id FROM users WHERE id = $1', [decodedToken.userId]);
                if (userResult.rowCount === 0) {
                    // User does not exist, clear the token cookie and return an empty object
                    // By not throwing a redirect, we allow the user to stay on the homepage without being logged in
                    return {};
                }
            } finally {
                client.release();
            }

            // If everything checks out, return the username
			return { username: decodedToken.username as string };
		} catch (err) {
            // Token is not valid, clear the cookie or take any other necessary action
            return {};
		}
	}

	// No token or invalid token, return an empty object
	return {};
}
