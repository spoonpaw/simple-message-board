// src/routes/message/+server.ts
import type {RequestEvent} from '@sveltejs/kit';
import {validateUser} from '$lib/server/auth';
import sanitizeHtml from 'sanitize-html';
import {createNewPrivateMessage} from '$lib/server/db/queries/privateMessages/createNewPrivateMessage';
import {getUserIdByUsername} from "$lib/server/db/queries/users/getUserIdByUsername";
import {getTextFromHtml} from "$lib/shared/htmlUtils/getTextFromHtml";
import {UserMailButtonConnections} from "$lib/server/sse/userMailButtonConnections";
import {UserMailPageConnections} from "$lib/server/sse/userMailPageConnections";

export async function POST(requestEvent: RequestEvent) {
	console.log('POST request received for /message');

	const user = await validateUser(requestEvent);
	if (!user) {
		console.log('User not authenticated');
		return new Response(JSON.stringify({message: 'Unauthorized'}), {status: 401});
	}

	const requestData = await requestEvent.request.json();
	const {recipientUsername, subject, content} = requestData;
	console.log('Request data:', requestData);

	// Validate recipientUsername, subject, and content
	if (!recipientUsername.trim() || !subject.trim() || subject.length > 60 || !content.trim()) {
		return new Response(JSON.stringify({message: 'Invalid input: Check recipient, subject, and content fields'}), {status: 400});
	}

	// Validate content length
	if (getTextFromHtml(content).length > 8000) {
		return new Response(JSON.stringify({message: 'Content exceeds 8000 characters'}), {status: 400});
	}

	try {
		const recipientId = await getUserIdByUsername(recipientUsername);
		if (!recipientId) {
			console.log('Recipient not found for username:', recipientUsername);
			return new Response(JSON.stringify({message: 'Recipient not found'}), {status: 404});
		}

		// Sanitize the content
		const sanitizedContent = sanitizeHtml(content, {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
			allowedAttributes: {
				...sanitizeHtml.defaults.allowedAttributes,
				img: ['src', 'alt', 'title', 'width', 'height']
			},
			allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel']
		});
		console.log('Sanitized content:', sanitizedContent);


		const newMessage = await createNewPrivateMessage(
			user.id,
			recipientId,
			subject,
			sanitizedContent
		);
		console.log('New message created:', newMessage);

		// Sending event to the Mail Button channel
		const userMailButtonConnections = UserMailButtonConnections.getInstance();
		const sendEventToMailButton = userMailButtonConnections.getSendEvent(recipientId);
		if (sendEventToMailButton) {
			sendEventToMailButton('newMessageReceived');
			console.log(`[MailButtonEventsSSE] 'newMessageReceived' event sent to user ${recipientId}`);
		}

		// Sending event to the Mail Page channel
		const userMailPageConnections = UserMailPageConnections.getInstance();
		const sendEventToMailPage = userMailPageConnections.getSendEvent(recipientId);
		if (sendEventToMailPage) {
			sendEventToMailPage('newMessageReceived');
			console.log(`[MailPageEventsSSE] 'newMessageReceived' event sent to user ${recipientId}`);
		}

		return new Response(JSON.stringify(newMessage), {status: 200, headers: {'Content-Type': 'application/json'}});
	} catch (err) {
		console.error('Error in POST request:', err);
		return new Response(JSON.stringify({message: 'Server Error'}), {status: 500});
	}
}
