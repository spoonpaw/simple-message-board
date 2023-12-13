// src/routes/category/[id]/+server.ts

import type { RequestEvent } from '@sveltejs/kit';
import { pool } from '$lib/server';
import { validateUser } from '$lib/server/auth';
import { getPermissionsByUserId } from '$lib/server/db/queries/permissions/getPermissionsByUserId';

export async function PUT(requestEvent: RequestEvent) {
	const { request, params } = requestEvent;
	const categoryId = params.id;
	let client;

	try {
		// Validate the user
		const user = await validateUser(requestEvent);
		if (!user) {
			return new Response(null, { status: 401 }); // Unauthorized
		}

		// Check if the user has permission to edit categories
		const permissions = await getPermissionsByUserId(user.id);
		const canEditCategory = permissions.some(p => p.name === 'modify_category');
		if (!canEditCategory) {
			return new Response(null, { status: 403 }); // Forbidden
		}

		client = await pool.connect();

		// Parse the request body to get updated category details
		const body = await request.json();
		const { title, description } = body;

        // Basic server-side validation
        if (!title || title.length > 30 || !description || description.length > 200) {
            return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
        }

		// Update the category details
		await client.query('UPDATE categories SET title = $1, description = $2 WHERE id = $3', [title, description, categoryId]);

		// Fetch the updated list of categories
		const result = await client.query('SELECT * FROM categories WHERE is_deleted = FALSE');
		const updatedCategories = result.rows;

		client.release();
		return new Response(JSON.stringify(updatedCategories), { status: 200, headers: { 'Content-Type': 'application/json' } });
	} catch (error) {
		console.error('Error updating category:', error);
		if (client) client.release();
		return new Response(null, { status: 500 });
	}
}

export async function DELETE(requestEvent: RequestEvent) {
	const { params } = requestEvent;
	const categoryId = params.id;
	let client;

	try {
		// Validate the user
		const user = await validateUser(requestEvent);
		if (!user) {
			return new Response(null, { status: 401 }); // Unauthorized
		}

        // Check if the user has permission to delete categories
        const permissions = await getPermissionsByUserId(user.id);
        const canDeleteCategory = permissions.some(p => p.name === 'delete_category');
        if (!canDeleteCategory) {
            return new Response(null, { status: 403 }); // Forbidden
        }

		client = await pool.connect();

		// Mark the category as deleted
		await client.query('UPDATE categories SET is_deleted = TRUE WHERE id = $1', [categoryId]);

		// Fetch the updated list of categories
		const result = await client.query('SELECT * FROM categories WHERE is_deleted = FALSE');
		const updatedCategories = result.rows;

		client.release();
		return new Response(JSON.stringify(updatedCategories), { status: 200, headers: { 'Content-Type': 'application/json' } });
	} catch (error) {
		console.error('Error deleting category:', error);
		if (client) client.release();
		return new Response(null, { status: 500 });
	}
}
