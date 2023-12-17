// src/lib/server/db/queries/privateMessages/updatePrivateMessageAsRead.ts

import {pool} from "$lib/server";

/**
 * Marks a message as read by setting its read_at field to the current timestamp.
 * @param {string} messageId - The ID of the message to be marked as read.
 * @param {string} userId - The ID of the authenticated user.
 * @returns {Promise<string>} The timestamp when the message was read.
 */
export async function updatePrivateMessageAsRead(messageId: string, userId: string) {
	const client = await pool.connect();
	try {
		// Update the read_at field only if the user is the recipient of the message
		const result = await client.query(
			'UPDATE private_messages SET read_at = NOW() WHERE id = $1 AND recipient_id = $2 RETURNING read_at',
			[messageId, userId]
		);

		// Check if the message was successfully updated
		if (result.rows.length > 0) {
			return result.rows[0].read_at;
		} else {
			throw new Error('Message not found, already read, or user is not the recipient');
		}
	} catch (error) {
		console.error('Error marking message as read:', error);
		throw error;
	} finally {
		client.release();
	}
}
