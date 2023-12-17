// src/routes/category/[id]/+page.server.ts

import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import type { PageServerData } from './$types';
import { getThreadsByCategoryId, pool } from '$lib/server';
import {getPermissionsByUserId} from "$lib/server/db/queries/permissions/getPermissionsByUserId";
import type {Permission} from "$lib/shared";
import {checkUnreadPrivateMessagesByUserId} from "$lib/server/db/queries/users/checkUnreadPrivateMessagesByUserId";

export async function load(requestEvent: RequestEvent): Promise<PageServerData> {
	const { params } = requestEvent;

	// Try to validate the user; if not authenticated, proceed as 'Anonymous'
	const authenticatedUser = await validateUser(requestEvent);
	let username = 'Anonymous';
	let userid: string | undefined = undefined;
	let permissions: Permission[] = [];
	let hasUnreadMessages = false;

	if (authenticatedUser) {
		username = authenticatedUser.username;
		userid = authenticatedUser.id;
		permissions = await getPermissionsByUserId(userid);
		hasUnreadMessages = await checkUnreadPrivateMessagesByUserId(userid);
	}

	const categoryId = params.id;
	if (!categoryId) {
		throw error(400, 'Category ID is required');
	}

	const client = await pool.connect();

	// Fetch category information
	const categoryResult = await client.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
	const category = categoryResult.rows[0];
	if (!category) {
		client.release();
		throw error(404, 'Category not found');
	}

	// Use helper function to fetch threads
	const threads = await getThreadsByCategoryId(categoryId);


	client.release();

	return {
		username,
		userid,
		category,
		threads,
		permissions,
		hasUnreadMessages
	};
}
