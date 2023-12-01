// // src/routes/thread/[id]/+server.ts
//
// import type { RequestEvent } from '@sveltejs/kit';
// import { validateUser } from '$lib/server/auth';
// import { getPostsByThreadId, pool } from '$lib/server';
// import { error } from '@sveltejs/kit';
//
// export async function POST(requestEvent: RequestEvent) {
// 	const { params, request } = requestEvent;
// 	const authenticatedUser = await validateUser(requestEvent);
// 	if (!authenticatedUser) {
// 		return error(401, 'Unauthorized');
// 	}
//
// 	const threadId = params.id;
// 	if (!threadId) {
// 		return error(400, 'Thread ID is required');
// 	}
//
// 	const formData = await request.formData();
// 	const content = formData.get('content');
//
// 	if (typeof content !== 'string' || !content.trim()) {
// 		return error(400, 'Content is required');
// 	}
//
// 	const client = await pool.connect();
// 	try {
// 		await client.query('INSERT INTO posts (thread_id, user_id, content) VALUES ($1, $2, $3)', [threadId, authenticatedUser.id, content]);
// 		const posts = await getPostsByThreadId(threadId);  // Fetch updated posts
//
// 		return new Response(JSON.stringify(posts), { status: 200, headers: { 'Content-Type': 'application/json' } });
// 	} catch (err) {
// 		console.error(err);
// 		return error(500, 'Server Error');
// 	} finally {
// 		client.release();
// 	}
// }
