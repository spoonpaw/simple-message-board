// src/routes/mail/received/+server.ts

import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import {
	getPrivateMessagesByRecipientUserId
} from "$lib/server/db/queries/privateMessages/getPrivateMessagesByRecipientUserId";

export async function GET(requestEvent: RequestEvent) {
	console.log('GET request received for /mail/received');

	const user = await validateUser(requestEvent);
	if (!user) {
		console.log('User not authenticated');
		return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
	}

	try {
		const receivedMessages = await getPrivateMessagesByRecipientUserId(user.id);
		if (receivedMessages.length === 0) {
			console.log('No received messages found for user:', user.username);
			return new Response(JSON.stringify({ message: 'No messages found' }), { status: 404 });
		}

		console.log(`Received messages fetched for user: ${user.username}`);
		return new Response(JSON.stringify(receivedMessages), { status: 200, headers: { 'Content-Type': 'application/json' }});
	} catch (err) {
		console.error('Error in GET request:', err);
		return new Response(JSON.stringify({ message: 'Server Error' }), { status: 500 });
	}
}
