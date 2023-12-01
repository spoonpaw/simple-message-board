// src/lib/server/db/queries/threads/getPostsByThreadId.ts

import { pool } from '../../pool';

export async function getPostsByThreadId(threadId: string) {
	const client = await pool.connect();
	try {
		const postsResult = await client.query(
			`
            SELECT p.*, 
                   u.username as author_username,
                   u.id as author_id
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.thread_id = $1
            ORDER BY p.created_at ASC
        `,
			[threadId]
		);

		return postsResult.rows.map((row) => ({
			id: row.id,
			content: row.content,
			authorUsername: row.author_username,
			authorId: row.author_id,
			quotedPostId: row.quoted_post_id,
			createdAt: row.created_at,
			updatedAt: row.updated_at
		}));
	} finally {
		client.release();
	}
}
