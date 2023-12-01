// src/lib/server/db/queries/threads/getThreadById.ts

import { pool } from '../../pool';

export async function getThreadById(threadId: string) {
	const client = await pool.connect();
	try {
		const threadResult = await client.query(`
            SELECT t.*, 
                   u.username as creator_username,
                   c.title as category_title
            FROM threads t
            JOIN users u ON t.user_id = u.id
            JOIN categories c ON t.category_id = c.id
            WHERE t.id = $1
        `, [threadId]);

		if (threadResult.rows.length === 0) {
			return null;
		}

		return threadResult.rows[0];
	} finally {
		client.release();
	}
}
