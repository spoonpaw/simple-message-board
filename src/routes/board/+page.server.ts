// src/routes/board/+page.server.ts

import type { RequestEvent } from '@sveltejs/kit';
import type { PageServerData } from './$types';
import { validateUser } from '$lib/server/auth';
import { getCategories } from '$lib/server/db/queries/categories/getCategories';
import {getPermissionsByUserId} from "$lib/server/db/queries/permissions/getPermissionsByUserId";
import type { Permission } from '$lib/shared';
import {checkUnreadPrivateMessagesByUserId} from "$lib/server/db/queries/users/checkUnreadPrivateMessagesByUserId";

export async function load(requestEvent: RequestEvent): Promise<PageServerData> {
	console.log('Starting load function for board page.');

	const authenticatedUser = await validateUser(requestEvent);
	let username: string;
	let userid: string | undefined;
	let permissions: Permission[] = [];
	let hasUnreadMessages = false;

	if (!authenticatedUser) {
		console.log('No authenticated user, viewing anonymously.');
		username = 'Anonymous';
		// userid remains undefined for anonymous users
	} else {
		console.log('User authenticated, fetching categories and permissions.');
		username = authenticatedUser.username;
		userid = authenticatedUser.id;
		permissions = await getPermissionsByUserId(userid);
		hasUnreadMessages = await checkUnreadPrivateMessagesByUserId(authenticatedUser.id);
	}

	const categories = await getCategories();

	console.log('Returning data for board page.');
	return {
		username: username,
		userid: userid, // This can be undefined for anonymous users
		categories: categories,
		permissions: permissions, // Include permissions in the returned data
		hasUnreadMessages: hasUnreadMessages, // Add this line
	};
}
