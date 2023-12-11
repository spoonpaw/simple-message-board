// src/routes/category/+server.ts

import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import { getUserPermissionsByUserId } from '$lib/server/db/queries/permissions/getPermissionsByUserId';
import { getCategories } from '$lib/server/db/queries/categories/getCategories';
import {pool} from "$lib/server";

export async function POST(requestEvent: RequestEvent) {
	const request = requestEvent.request;
	let client;

	try {
		const user = await validateUser(requestEvent);
		if (!user) {
			return new Response(null, { status: 401 }); // Unauthorized
		}

		// Check if the user has permission to create categories
		const permissions = await getUserPermissionsByUserId(user.id);
		const canCreateCategory = permissions.some(p => p.name === 'create_category');
		if (!canCreateCategory) {
			return new Response(null, { status: 403 }); // Forbidden
		}

		const requestData = await request.json();
		const { title, description } = requestData;

		// Basic server-side validation
		if (!title || title.length > 30 || !description || description.length > 200) {
			return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
		}

		client = await pool.connect();

		// Insert the new category into the database
		await client.query('INSERT INTO categories (title, description) VALUES ($1, $2)', [title, description]);
		client.release();

        // Fetch the updated list of categories using the getCategories function
        const updatedCategories = await getCategories();

		return new Response(JSON.stringify(updatedCategories), { status: 200, headers: { 'Content-Type': 'application/json' } });
	} catch (error) {
		console.error('Error creating category:', error);
		if (client) client.release();
		return new Response(null, { status: 500 });
	}
}
