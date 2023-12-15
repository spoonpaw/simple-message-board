// src/routes/user/[id]/+page.server.ts

import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import {getPermissionsByUserId} from "$lib/server/db/queries/permissions/getPermissionsByUserId";
import { getHierarchyLevelByUserId } from "$lib/server/db/queries/users/getHierarchyLevelByUserId"; // Import the new function
import type { Permission } from '$lib/shared';
import {getUserById} from "$lib/server/db/queries/users/getUserById";
import {getRoleByUserId} from "$lib/server/db/queries/users/getRoleByUserId";
import {getAllRoles} from "$lib/server/db/queries/roles/getAllRoles";
import {getPostCountByUserId} from "$lib/server/db/queries/users/getPostCountByUserId";

export async function load(requestEvent: RequestEvent) {
	const {id} = requestEvent.params;
	if (!id) {
		console.error('User ID is undefined');
		throw error(404, 'User ID is required');
	}

	// Attempt to authenticate the user but do not redirect if not authenticated
	const authenticatedUser = await validateUser(requestEvent);

	const userProfile = await getUserById(id);
	if (!userProfile) {
		console.error('No user profile found for user ID:', id);
		throw error(404, 'User profile not found');
	}

	let permissions: Permission[] = [];
    let authenticatedUserHierarchyLevel = null;
    let requestedUserHierarchyLevel = null;

	if (authenticatedUser) {
		permissions = await getPermissionsByUserId(authenticatedUser.id);
        authenticatedUserHierarchyLevel = await getHierarchyLevelByUserId(authenticatedUser.id);
	}

    requestedUserHierarchyLevel = await getHierarchyLevelByUserId(id);
    const role = await getRoleByUserId(id);

	// Check if the authenticated user is viewing their own profile
	const isOwnProfile = authenticatedUser && authenticatedUser.id === id;

	const roles = await getAllRoles();

	const postCount = await getPostCountByUserId(id);

	return {
		userProfile: {
			username: userProfile.username,
			email: userProfile.email,
			profileImageUrl: userProfile.profile_image_url,
			bio: userProfile.bio,
			createdAt: userProfile.created_at,
			lastLogin: userProfile.last_login,
            hierarchyLevel: requestedUserHierarchyLevel, // Add hierarchy level here
			isOwnProfile,
			id: userProfile.id,
			banned: userProfile.banned,
			role,
			postCount
		},
		isAuthenticated: !!authenticatedUser,
		authenticatedUserId: authenticatedUser ? authenticatedUser.id : null,
		authenticatedUsername: authenticatedUser ? authenticatedUser.username : 'Anonymous',
        authenticatedUserHierarchyLevel, // Pass hierarchy level of authenticated user
		permissions: permissions,
		roles
	};
}
