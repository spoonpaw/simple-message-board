// src/lib/server/db/queries/threads/getPostsByThreadId.ts

import {pool} from '../../pool';

export async function getPostsByThreadId(threadId: string) {
	const client = await pool.connect();
	try {
		const postsResult = await client.query(
			`
            SELECT p.id, p.quoted_post_id, p.content, p.created_at, p.updated_at,
                   p.deleted,
                   p.deleted_at,
                   u.username as author_username,
                   u.id as author_id,
                   u.profile_image_url as author_profile_image_url,
                   r.name as author_role_name,
                   pc.post_count as author_post_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN (
                SELECT p.user_id, COUNT(*) as post_count
                FROM posts p
                JOIN threads t ON p.thread_id = t.id
                JOIN categories c ON t.category_id = c.id
                WHERE p.deleted = FALSE AND c.is_deleted = FALSE
                GROUP BY p.user_id
            ) pc ON p.user_id = pc.user_id
            WHERE p.thread_id = $1
            ORDER BY p.created_at ASC
        `,
			[threadId]
		);

		// Create a map to hold posts by their ID
		const postsMap = new Map();

		postsResult.rows.forEach(row => {
			postsMap.set(row.id, {
				id: row.id,
				quotedPostId: row.quoted_post_id,
				content: row.deleted ? '[deleted]' : row.content,
				createdAt: row.created_at,
				updatedAt: row.updated_at,
				deleted: row.deleted,
				deletedAt: row.deleted_at,
				authorId: row.author_id,
				authorUsername: row.author_username,
				authorProfileImageUrl: row.author_profile_image_url,
				authorRoleName: row.author_role_name,
				authorPostCount: row.author_post_count,
				originatingPost: false, // Placeholder for originating post
				quotedPost: null // Placeholder for quoted post
			});
		});

		// Process each post to include quoted post data
		postsMap.forEach((post) => {
			if (post.quotedPostId && postsMap.has(post.quotedPostId)) {
				const quotedPost = postsMap.get(post.quotedPostId);
				post.quotedPost = quotedPost;
			}
		});

		// Convert map values to an array
		const posts = Array.from(postsMap.values());

		// Mark the first post as originating
		if (posts.length > 0) {
			posts[0].originatingPost = true;
		}

		return posts;
	} finally {
		client.release();
	}
}
