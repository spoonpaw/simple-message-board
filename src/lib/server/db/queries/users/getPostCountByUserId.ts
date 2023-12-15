// src/lib/server/db/queries/users/getPostCountByUserId.ts

import { pool } from "$lib/server";

export async function getPostCountByUserId(userId: string): Promise<number> {
	const client = await pool.connect();
	try {
		const postCountResult = await client.query(
			`
            SELECT COUNT(*)
            FROM posts p
            JOIN threads t ON p.thread_id = t.id
            JOIN categories c ON t.category_id = c.id
            WHERE p.user_id = $1 AND p.deleted = FALSE AND t.is_deleted = FALSE AND c.is_deleted = FALSE
            `,
			[userId]
		);

		return parseInt(postCountResult.rows[0].count, 10);
	} catch (error) {
		console.error('Error fetching post count:', error);
		throw error;
	} finally {
		client.release();
	}
}
