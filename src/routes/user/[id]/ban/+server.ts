// src/routes/user/[id]/ban/+server.ts

import type {RequestEvent} from '@sveltejs/kit';
import {pool} from '$lib/server';
import {getPermissionsByUserId} from '$lib/server/db/queries/permissions/getPermissionsByUserId';
import {validateUser} from "$lib/server/auth";
import {getHierarchyLevelByUserId} from "$lib/server/db/queries/users/getHierarchyLevelByUserId";
import {getUserById} from "$lib/server/db/queries/users/getUserById"; // Make sure you have this function

export async function PUT(requestEvent: RequestEvent) {
	const userId = requestEvent.params.id;

	if (!userId) {
		return new Response('User ID is required', {status: 400});
	}

	const requestData = await requestEvent.request.json();
	const banStatus = requestData.ban;  // true to ban, false to unban

	let client;

	try {
		const user = await validateUser(requestEvent);

		if (!user) {
			return new Response(null, {status: 401}); // Unauthorized
		}

		const permissions = await getPermissionsByUserId(user.id);

		const canBanUsers = permissions.some(p => p.name === 'ban_user_lower_role');
		if (!canBanUsers) {
			return new Response(null, {status: 403}); // Forbidden
		}

		const authenticatedUserHierarchyLevel = await getHierarchyLevelByUserId(user.id);
		const targetUserHierarchyLevel = await getHierarchyLevelByUserId(userId);

		if (authenticatedUserHierarchyLevel === null || (targetUserHierarchyLevel !== null && authenticatedUserHierarchyLevel >= targetUserHierarchyLevel)) {
			return new Response(null, {status: 403}); // Forbidden to ban/unban this user
		}

		client = await pool.connect();

		const banResult = await client.query('UPDATE users SET banned = $1 WHERE id = $2', [banStatus, userId]);

		if (banResult.rowCount === 0) {
			client.release();
			return new Response(JSON.stringify({message: 'User not found'}), {
				status: 404,
				headers: {'Content-Type': 'application/json'}
			});
		}

		const updatedUserProfile = await getUserById(userId);

		if (!updatedUserProfile) {
			client.release();
			return new Response(JSON.stringify({message: 'Failed to retrieve updated user data'}), {
				status: 500,
				headers: {'Content-Type': 'application/json'}
			});
		}

		client.release();
		return new Response(JSON.stringify({userProfile: updatedUserProfile}), {
			status: 200,
			headers: {'Content-Type': 'application/json'}
		});
	} catch (error) {
		if (client) client.release();
		return new Response(null, {status: 500});
	}
}
