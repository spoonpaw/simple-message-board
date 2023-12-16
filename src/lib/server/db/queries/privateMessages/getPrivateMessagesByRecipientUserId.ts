// src/lib/server/db/queries/privateMessages/getPrivateMessagesByRecipientUserId.ts

import { pool } from "$lib/server";

export async function getPrivateMessagesByRecipientUserId(recipientUserId: string) {
	const client = await pool.connect();
	try {
		const messagesResult = await client.query(
			`
            SELECT pm.id, pm.sender_id, pm.recipient_id, pm.subject, pm.content, pm.sent_at, pm.read_at, u.username AS sender_username
            FROM private_messages pm
            JOIN users u ON pm.sender_id = u.id
            WHERE pm.recipient_id = $1 AND pm.is_deleted_recipient = false
            ORDER BY pm.sent_at DESC
            `,
			[recipientUserId]
		);

        return messagesResult.rows || [];  // Ensure an empty array is returned if no rows are found
	} catch (error) {
		console.error('Error fetching private messages:', error);
		throw error;
	} finally {
		client.release();
	}
}
