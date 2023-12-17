// src/routes/mail/$types.d.ts

import type {PrivateMessage} from "$lib/shared";

export interface ReceivedMessageView extends PrivateMessage {
	sender_username: string; // Username of the sender
}

export interface SentMessageView extends PrivateMessage {
	recipient_username: string; // Username of the recipient
}

export interface PageServerData {
	username: string;
	userId: string;
	receivedMessages: ReceivedMessageView[]; // Array of received message views
	sentMessages: SentMessageView[]; // Array of sent message views
	permissions: Permission[];
	hasUnreadMessages: boolean;
}
