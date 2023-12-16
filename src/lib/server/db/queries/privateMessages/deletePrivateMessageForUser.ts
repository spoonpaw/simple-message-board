// src/lib/server/db/queries/privateMessages/deletePrivateMessageForUser.ts

// Assuming you're using a PostgreSQL client like 'pg'
import { pool } from '$lib/server/db/pool'; // Update the import path as per your project structure

/**
 * Marks a message as deleted for a specific user.
 *
 * @param {string} messageId - The ID of the message to be deleted.
 * @param {string} userId - The ID of the user performing the deletion.
 */
export async function deletePrivateMessageForUser(messageId: string, userId: string): Promise<void> {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');

		// Check if the user is the sender or recipient of the message
		const res = await client.query(
			`SELECT sender_id, recipient_id FROM private_messages WHERE id = $1`,
			[messageId]
		);

		const message = res.rows[0];
		if (!message) {
			throw new Error('Message not found');
		}

		if (message.sender_id === userId) {
			// User is the sender
			await client.query(
				`UPDATE private_messages SET is_deleted_sender = TRUE WHERE id = $1`,
				[messageId]
			);
		} else if (message.recipient_id === userId) {
			// User is the recipient
			await client.query(
				`UPDATE private_messages SET is_deleted_recipient = TRUE WHERE id = $1`,
				[messageId]
			);
		} else {
			throw new Error('User is not authorized to delete this message');
		}

		await client.query('COMMIT');
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}
