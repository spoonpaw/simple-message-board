// src/routes/mail/+page.server.ts

import {redirect} from '@sveltejs/kit';
import type {RequestEvent} from '@sveltejs/kit';
import {validateUser} from '$lib/server/auth';
import {
	getPrivateMessagesByRecipientUserId
} from '$lib/server/db/queries/privateMessages/getPrivateMessagesByRecipientUserId';
import {getPermissionsByUserId} from "$lib/server/db/queries/permissions/getPermissionsByUserId";
import {
	getPrivateMessagesBySenderUserId
} from "$lib/server/db/queries/privateMessages/getPrivateMessagesBySenderUserId";
import {checkUnreadPrivateMessagesByUserId} from "$lib/server/db/queries/users/checkUnreadPrivateMessagesByUserId"; // Adjust this import based on your actual shared types

export async function load(requestEvent: RequestEvent) {
	const authenticatedUser = await validateUser(requestEvent);

	if (!authenticatedUser) {
		throw redirect(302, '/');
	}

	// Fetch received and sent private messages for the authenticated user
	const receivedMessages = await getPrivateMessagesByRecipientUserId(authenticatedUser.id);
	const sentMessages = await getPrivateMessagesBySenderUserId(authenticatedUser.id);

	const permissions = await getPermissionsByUserId(authenticatedUser.id);
	const hasUnreadMessages = await checkUnreadPrivateMessagesByUserId(authenticatedUser.id);


	return {
		username: authenticatedUser.username,
		userId: authenticatedUser.id,
		receivedMessages,
		sentMessages,
		permissions: permissions,
		hasUnreadMessages
	};
}
