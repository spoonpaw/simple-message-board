// src/routes/message/[id]/read/+server.ts

import type { RequestEvent } from "@sveltejs/kit";
import { validateUser } from "$lib/server/auth";
import {updatePrivateMessageAsRead} from "$lib/server/db/queries/privateMessages/updatePrivateMessageAsRead";

export async function POST(requestEvent: RequestEvent) {
	try {
		const user = await validateUser(requestEvent);
		if (!user) {
			return new Response(null, { status: 401 });
		}

		const messageId = requestEvent.params.id;
		if (!messageId) {
			return new Response(null, { status: 400 });
		}

        const read_at = await updatePrivateMessageAsRead(messageId, user.id);
		return new Response(JSON.stringify({ read_at }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error marking message as read:', error);
		return new Response(null, { status: 500 });
	}
}
