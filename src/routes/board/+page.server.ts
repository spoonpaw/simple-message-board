// src/routes/board/+page.server.ts

import {error, redirect} from '@sveltejs/kit';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import {env} from '$env/dynamic/private';
import {pool} from '$lib'; // Make sure you have imported 'pool' from your database connection module
import type {PageServerData} from './$types';
import type {RequestEvent} from '@sveltejs/kit';

// Function to fetch categories from the database
async function fetchCategories() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM categories');
        const categories = result.rows;
        client.release();

        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

export async function load({request}: RequestEvent): Promise<PageServerData> {
	const JWT_SECRET = env.JWT_SECRET as string;
	if (!JWT_SECRET) {
		throw error(500, 'JWT_SECRET is not defined. Please check your environment variables.');
	}

	const cookieHeader = request.headers.get('cookie');
	if (!cookieHeader) {
		throw redirect(302, '/');
	}

	const cookies = cookie.parse(cookieHeader);
	const token = cookies['token'];
	if (!token) {
		throw redirect(302, '/');
	}

	try {
		const decodedToken = jwt.verify(token, JWT_SECRET);
		if (typeof decodedToken !== 'object' || decodedToken === null) {
			throw new Error('Invalid token');
		}

		// Extract the user ID from the decoded token
		const userId = decodedToken.userId as string;

		// Connect to the database and check if the user still exists
		const client = await pool.connect();
		try {
			const userResult = await client.query('SELECT id FROM users WHERE id = $1', [userId]);
			if (userResult.rowCount === 0) {
				// If the user does not exist, redirect to the login page
				throw redirect(302, '/');
			}

            // If the user exists, fetch the categories
            const categories = await fetchCategories();

            // Return the necessary data for the page including categories
			return {
                username: decodedToken.username as string,
                categories: categories,
			};
		} finally {
			client.release();
		}
	} catch (err) {
		// If there's an error verifying the token or querying the database, redirect to login
		throw redirect(302, '/');
	}
}
