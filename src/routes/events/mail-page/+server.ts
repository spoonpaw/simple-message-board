// src/routes/events/mail-page/+server.ts

import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import { UserMailPageConnections } from '$lib/server/sse/userMailPageConnections';

export async function GET(requestEvent: RequestEvent): Promise<Response> {
	const authenticatedUser = await validateUser(requestEvent);
	console.log(`[MailPageEventsSSE] authenticatedUser value = ${JSON.stringify(authenticatedUser)}`);
	const userId = authenticatedUser?.id;
	if (typeof userId !== 'string') {
		console.error('[MailPageEventsSSE] Error: User ID is undefined');
		return new Response('User ID is required', { status: 400 });
	}

	console.log(`[MailPageEventsSSE] Connection established for user ID: ${userId}`);

	const headers = {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	};

	const userMailPageConnections = UserMailPageConnections.getInstance();

	const stream = new ReadableStream({
		start(controller) {
			const sendEvent = (data: string) => {
				console.log(`[MailPageEventsSSE] Sending event to user ${userId}:`, data);
				controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
			};

			userMailPageConnections.addConnection(userId, sendEvent);
			sendEvent(`User ${userId} successfully connected to the Mail Page Events channel.`);

			// Heartbeat: Send a comment line every 50 seconds to keep the connection alive
			const heartbeatInterval = setInterval(() => {
				controller.enqueue(':heartbeat\n\n');
			}, 50000);

			// Stop the heartbeat when the connection is closed
			requestEvent.request.signal.addEventListener('abort', () => {
				clearInterval(heartbeatInterval);
			console.log(`[MailPageEventsSSE] Connection closed for user ID: ${userId}`);
			userMailPageConnections.removeConnection(userId);
			});
		}
	});

	return new Response(stream, { headers });
};
