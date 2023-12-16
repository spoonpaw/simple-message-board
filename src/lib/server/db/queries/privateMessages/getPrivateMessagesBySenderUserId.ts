// src/lib/server/db/queries/privateMessages/getPrivateMessagesBySenderUserId.ts

import { pool } from "$lib/server";

export async function getPrivateMessagesBySenderUserId(senderUserId: string) {
	const client = await pool.connect();
	try {
		const messagesResult = await client.query(
			`
            SELECT pm.id, pm.sender_id, pm.recipient_id, pm.subject, pm.content, pm.sent_at, pm.read_at, u.username AS recipient_username
            FROM private_messages pm
            JOIN users u ON pm.recipient_id = u.id
            WHERE pm.sender_id = $1 AND pm.is_deleted_sender = false
            ORDER BY pm.sent_at DESC
            `,
			[senderUserId]
		);

		return messagesResult.rows || [];  // Return an empty array if no messages are found
	} catch (error) {
		console.error('Error fetching private messages:', error);
		throw error;
	} finally {
		client.release();
	}
}
