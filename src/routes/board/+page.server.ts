import {redirect} from '@sveltejs/kit';
import type {RequestEvent} from '@sveltejs/kit';
import type {PageServerData} from './$types';
import {validateUser} from '$lib/server/auth'; // Import the validateUser function
import {pool} from '$lib/server';

async function fetchCategories() {
	try {
		console.log("Connecting to database to fetch categories.");
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

export async function load(requestEvent: RequestEvent): Promise<PageServerData> {
	console.log("Starting load function for board page.");

	const authenticatedUser = await validateUser(requestEvent);

	if (!authenticatedUser) {
		console.log("No authenticated user, redirecting to root.");
		throw redirect(302, '/');
	}

	console.log("User authenticated, fetching categories.");
	const categories = await fetchCategories();

	console.log("Returning data for board page.");
	return {
		username: authenticatedUser.username,
		categories: categories,
	};

}
