// src/lib/server/db/queries/privateMessages/createNewPrivateMessage.ts

import { pool } from "$lib/server";

export async function createNewPrivateMessage(senderId: string, recipientId: string, subject: string, content: string) {
	const client = await pool.connect();
	try {
		// Insert the new message into the private_messages table
		const insertResult = await client.query(
			`
            INSERT INTO private_messages (sender_id, recipient_id, subject, content)
            VALUES ($1, $2, $3, $4)
            RETURNING id, sent_at
            `,
			[senderId, recipientId, subject, content]
		);

		const newMessage = insertResult.rows[0];
		if (!newMessage) {
			throw new Error('Failed to create message');
		}

		// Fetch the recipient's username
		const usernameResult = await client.query(
			'SELECT username FROM users WHERE id = $1',
			[recipientId]
		);

		const recipientUsername = usernameResult.rows[0].username;

		// Return the new message details in the shape of SentMessageView
		return {
			id: newMessage.id,
			sender_id: senderId,
			recipient_id: recipientId,
			recipient_username: recipientUsername,
			subject,
			content,
			sent_at: newMessage.sent_at,
			read_at: null,
			is_deleted_sender: false,
			is_deleted_recipient: false
		};
	} catch (error) {
		console.error('Error creating new private message:', error);
		throw error;
	} finally {
		client.release();
	}
}
