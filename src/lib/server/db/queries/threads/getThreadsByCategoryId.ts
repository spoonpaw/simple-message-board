// src/lib/server/db/queries/threads/getThreadsByCategoryId.ts

import {pool} from '$lib/server';
import type {ThreadCategoryView} from '$lib/shared/types/ThreadCategoryView';

// Define a local type for the specific structure returned by the query
export async function getThreadsByCategoryId(categoryId: string): Promise<ThreadCategoryView[]> {
	const client = await pool.connect();
	try {
		const threadsResult = await client.query(
			`
				-- Select all columns from the threads table (aliased as t)
				-- and the username column from the users table (aliased as u)
				SELECT t.*, 
					   u.username as creator_username, 

					   -- Use GREATEST to ensure a non-negative count. 
					   -- Subtract 1 from the count of posts in this thread to get the reply count
					   -- (assuming the first post is not counted as a reply).
					   GREATEST((SELECT COUNT(*) FROM posts WHERE thread_id = t.id) - 1, 0) as reply_count,

					   -- This CASE statement determines the username of the last person who replied to the thread.
					   -- It only runs if there's more than one post in the thread (implying at least one reply).
					   CASE 
						   WHEN (SELECT COUNT(*) FROM posts WHERE thread_id = t.id) > 1 THEN 
							   -- Subquery to get the username of the last replier.
							   -- It finds the latest post in the thread and retrieves the username of its author.
							   (SELECT username FROM users WHERE id = 
								   (SELECT user_id FROM posts WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1)) 
						   ELSE NULL
					   END as last_replier_username,

					   -- This CASE statement determines the timestamp of the last reply in the thread.
					   -- It only runs if there's more than one post in the thread.
					   CASE 
						   WHEN (SELECT COUNT(*) FROM posts WHERE thread_id = t.id) > 1 THEN 
							   -- Subquery to get the timestamp of the last post in the thread.
							   (SELECT created_at FROM posts WHERE thread_id = t.id ORDER BY created_at DESC LIMIT 1) 
						   ELSE NULL
					   END as last_reply_at

				-- The FROM clause specifies the threads table for the main query.
				FROM threads t

				-- JOIN clause to include data from the users table.
				-- This join is necessary to get the username of the thread creator.
				JOIN users u ON t.user_id = u.id

            -- WHERE clause filters the threads by the category_id and excludes deleted threads.
            WHERE t.category_id = $1 AND t.is_deleted = FALSE

			`,
			[categoryId]
		);
		return threadsResult.rows.map((row) => ({
			id: row.id,
			categoryId: row.category_id,
			userId: row.user_id,
			title: row.title,
			pinned: row.pinned,
			locked: row.locked,
			createdAt: row.created_at,
			creatorUsername: row.creator_username,
			replyCount: row.reply_count,
			lastReplierUsername: row.last_replier_username,
			lastReplyAt: row.last_reply_at
		}));
	} finally {
		client.release();
	}
}
