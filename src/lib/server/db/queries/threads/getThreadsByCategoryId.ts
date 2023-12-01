// src/lib/server/db/queries/threads/getThreadsByCategory.ts

import {pool} from "$lib/server";

export async function getThreadsByCategoryId(categoryId: string) {
	const client = await pool.connect();
	try {
		const threadsResult = await client.query(`
			SELECT t.*, 
				   u.username as creator_username, 
				   GREATEST((SELECT COUNT(*) FROM posts WHERE thread_id = t.id) - 1, 0) as reply_count,
				   CASE 
					   WHEN (SELECT COUNT(*) FROM posts WHERE thread_id = t.id) > 1 THEN 
						   (SELECT username FROM users WHERE id = (SELECT user_id FROM posts WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1 OFFSET 1)) 
					   ELSE NULL
				   END as last_replier_username
			FROM threads t
			JOIN users u ON t.user_id = u.id
			WHERE t.category_id = $1
        `, [categoryId]);
		return threadsResult.rows.map(row => ({
			id: row.id,
			category_id: row.category_id,
			user_id: row.user_id,
			title: row.title,
			pinned: row.pinned,
			locked: row.locked,
			created_at: row.created_at,
			creator_username: row.creator_username,
			reply_count: row.reply_count,
			last_replier_username: row.last_replier_username
		}));
	} finally {
		client.release();
	}
}
