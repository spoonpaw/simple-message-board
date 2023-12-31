// src/routes/thread/[id]/+page.server.ts

import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import { getThreadById, getPostsByThreadId } from '$lib/server';
import {getPermissionsByUserId} from "$lib/server/db/queries/permissions/getPermissionsByUserId";
import type { Permission } from '$lib/shared';
import {checkUnreadPrivateMessagesByUserId} from "$lib/server/db/queries/users/checkUnreadPrivateMessagesByUserId";

export async function load(requestEvent: RequestEvent) {
	const {params} = requestEvent;

	const authenticatedUser = await validateUser(requestEvent);
	let username = 'Anonymous';
	let userid: string | undefined = undefined;
	let permissions: Permission[] = []; // Initialize an empty array for permissions
	let hasUnreadMessages = false;

	if (authenticatedUser) {
		username = authenticatedUser.username;
		userid = authenticatedUser.id;

        // Fetch permissions for the authenticated user
        permissions = await getPermissionsByUserId(userid);
		hasUnreadMessages = await checkUnreadPrivateMessagesByUserId(userid);

	}

	const threadId = params.id;
	if (!threadId) {
		throw error(400, 'Thread ID is required');
	}

	const thread = await getThreadById(threadId);
	if (!thread) {
		throw error(404, 'Thread not found');
	}

	const posts = await getPostsByThreadId(threadId);

	return {
		username,
		userid,
        permissions, // Pass permissions to the client
		thread: {
			...thread,
			posts: posts
		},
		hasUnreadMessages
	};
}
