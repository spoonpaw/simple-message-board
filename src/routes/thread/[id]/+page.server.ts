// src/routes/thread/[id]/+page.server.ts

import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import { getThreadById } from '$lib/server/db/queries/threads/getThreadById';
import {getPostsByThreadId} from "$lib/server";

export async function load(requestEvent: RequestEvent) {
	const { params } = requestEvent;

	const authenticatedUser = await validateUser(requestEvent);
	if (!authenticatedUser) {
		throw redirect(302, '/');
	}

	const threadId = params.id;
	if (!threadId) {
		throw error(400, 'Thread ID is required');
	}

	const thread = await getThreadById(threadId);
	if (!thread) {
		throw error(404, 'Thread not found');
	}

	const posts = await getPostsByThreadId(threadId);

	return {
		username: authenticatedUser.username,
		userid: authenticatedUser.id,
		thread: {
			...thread,
			posts: posts
		}
	};
}
