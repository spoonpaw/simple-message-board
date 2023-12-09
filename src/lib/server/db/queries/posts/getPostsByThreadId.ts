// src/lib/server/db/queries/threads/getPostsByThreadId.ts

import { pool } from '../../pool';

export async function getPostsByThreadId(threadId: string) {
	const client = await pool.connect();
	try {
		const postsResult = await client.query(
			`
            SELECT p.id,
                   CASE 
                       WHEN p.deleted THEN '[deleted]' 
                       ELSE p.content 
                   END as content,
                   p.created_at,
                   p.updated_at,
                   p.deleted,
                   p.deleted_at,
                   u.username as author_username,
                   u.id as author_id,
                   u.profile_image_url as author_profile_image_url,
                   r.name as author_role_name,
                   pc.post_count as author_post_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN roles r ON u.role_id = r.id  -- Join with roles table
            LEFT JOIN (
                SELECT user_id, COUNT(*) as post_count
                FROM posts
                WHERE deleted = FALSE
                GROUP BY user_id
            ) pc ON p.user_id = pc.user_id
            WHERE p.thread_id = $1
            ORDER BY p.created_at ASC
        `,
			[threadId]
		);

		const posts = postsResult.rows.map((row) => ({
			authorId: row.author_id,
			authorPostCount: row.author_post_count,
			authorProfileImageUrl: row.author_profile_image_url,
			authorRoleName: row.author_role_name,
			authorUsername: row.author_username,
			content: row.content,
			createdAt: row.created_at,
			deleted: row.deleted,
			deletedAt: row.deleted_at,
			id: row.id,
			updatedAt: row.updated_at,
			originatingPost: false // Initialize all posts with false
		}));

		if (posts.length > 0) {
			// Mark the first post as the originating post
			posts[0].originatingPost = true;
		}

		return posts;
	} finally {
		client.release();
	}
}
