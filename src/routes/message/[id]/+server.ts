// src/routes/message/[id]/+server.ts

import type { RequestEvent } from "@sveltejs/kit";
import { validateUser } from "$lib/server/auth";
import {deletePrivateMessageForUser} from "$lib/server/db/queries/privateMessages/deletePrivateMessageForUser";

export async function DELETE(requestEvent: RequestEvent) {
	try {
		// Validate the user
		const user = await validateUser(requestEvent);
		if (!user) {
			console.error('User not authenticated');
			return new Response(null, { status: 401 }); // Unauthorized
		}

		// Extract the message ID from the URL
		const messageId = requestEvent.params.id;
		if (!messageId) {
			console.error('Message ID is undefined');
			return new Response(null, { status: 400 }); // Bad Request
		}

		// Delete the message for the user
		await deletePrivateMessageForUser(messageId, user.id);

        // Return a success response
        return new Response(null, {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error handling message deletion: ', error);
		return new Response(null, { status: 500 }); // Internal Server Error
	}
}
