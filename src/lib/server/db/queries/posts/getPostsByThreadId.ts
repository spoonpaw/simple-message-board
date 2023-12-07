// src/lib/server/db/queries/threads/getPostsByThreadId.ts

import { pool } from '../../pool';

export async function getPostsByThreadId(threadId: string) {
	const client = await pool.connect();
	try {
		const postsResult = await client.query(
			`
            SELECT p.*, 
                   u.username as author_username,
                   u.id as author_id,
                   u.profile_image_url as author_profile_image_url,
                   r.name as author_role_name,  -- Include the role name
                   pc.post_count as author_post_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN roles r ON u.role_id = r.id  -- Join with roles table
            LEFT JOIN (
                SELECT user_id, COUNT(*) as post_count
                FROM posts
                GROUP BY user_id
            ) pc ON p.user_id = pc.user_id
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
			authorProfileImageUrl: row.author_profile_image_url,
			authorRoleName: row.author_role_name, // Map the role name
			authorPostCount: row.author_post_count,
			createdAt: row.created_at,
			updatedAt: row.updated_at
		}));
	} finally {
		client.release();
	}
}
