// src/lib/server/db/queries/users/getUserIdByUsername.ts
import { pool } from "$lib/server";

/**
 * Retrieves a user's ID based on their username.
 * @param {string} username - The username of the user.
 * @returns {Promise<string | null>} The ID of the user, or null if not found.
 */
export async function getUserIdByUsername(username: string): Promise<string | null> {
	const client = await pool.connect();
	try {
		const result = await client.query(
			'SELECT id FROM users WHERE username = $1',
			[username]
		);

		if (result.rows.length > 0) {
			return result.rows[0].id;  // Return the user ID
		} else {
			return null;  // User not found
		}
	} catch (error) {
		console.error('Error fetching user ID by username:', error);
		throw error;
	} finally {
		client.release();
	}
}
