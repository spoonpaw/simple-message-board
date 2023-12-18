// src/routes/events/mail-button/+server.ts

import type { RequestEvent } from '@sveltejs/kit';
import {UserMailButtonConnections} from '$lib/server/sse/userMailButtonConnections';
import { validateUser } from '$lib/server/auth';

export async function GET(requestEvent: RequestEvent): Promise<Response> {
	const authenticatedUser = await validateUser(requestEvent);
	console.log(`[MailButtonEventsSSE] authenticatedUser value = ${JSON.stringify(authenticatedUser)}`);
	const userId = authenticatedUser?.id;
	if (typeof userId !== 'string') {
		console.error('[MailButtonEventsSSE] Error: User ID is undefined');
		return new Response('User ID is required', {status: 400});
	}

	console.log(`[MailButtonEventsSSE] Connection established for user ID: ${userId}`);

	const headers = {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	};

	const userMailButtonConnections = UserMailButtonConnections.getInstance();

	const stream = new ReadableStream({
		start(controller) {
			const sendEvent = (data: string) => {
				console.log(`[MailButtonEventsSSE] Sending event to user ${userId}:`, data);
				controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
			};

			userMailButtonConnections.addConnection(userId, sendEvent);
			sendEvent(`User ${userId} successfully connected to the Mail Button Events channel.`);

			// Heartbeat: Send a comment line every 50 seconds to keep the connection alive
			const heartbeatInterval = setInterval(() => {
				controller.enqueue(':heartbeat\n\n');
			}, 50000);

			// Stop the heartbeat when the connection is closed
			requestEvent.request.signal.addEventListener('abort', () => {
				clearInterval(heartbeatInterval);
			console.log(`[MailButtonEventsSSE] Connection closed for user ID: ${userId}`);
			userMailButtonConnections.removeConnection(userId);
			});
		}
	});

	return new Response(stream, {headers});
};
