// src/lib/server/db/queries/users/checkUnreadPrivateMessagesByUserId.ts

import { pool } from "$lib/server";

export async function checkUnreadPrivateMessagesByUserId(userId: string): Promise<boolean> {
	const client = await pool.connect();
	try {
		const result = await client.query(
			`
            SELECT COUNT(*) 
            FROM private_messages 
            WHERE recipient_id = $1 
              AND read_at IS NULL 
              AND is_deleted_recipient = false
            `,
			[userId]
		);

		const unreadCount = parseInt(result.rows[0].count, 10);
		return unreadCount > 0;
	} catch (error) {
		console.error('Error checking for unread private messages:', error);
		throw error;
	} finally {
		client.release();
	}
}
