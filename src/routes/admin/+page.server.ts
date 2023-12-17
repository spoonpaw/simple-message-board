// src/routes/admin/+page.server.ts

import {redirect} from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { validateUser } from '$lib/server/auth';
import type { Permission, Role, RolePermission } from '$lib/shared';
import {getPermissionsByUserId} from "$lib/server/db/queries/permissions/getPermissionsByUserId";
import {getAllRoles} from "$lib/server/db/queries/roles/getAllRoles";
import {getAllPermissions} from "$lib/server/db/queries/permissions/getAllPermissions";
import {getAllRolePermissions} from "$lib/server/db/queries/rolePermissions/getAllRolePermissions";
import {checkUnreadPrivateMessagesByUserId} from "$lib/server/db/queries/users/checkUnreadPrivateMessagesByUserId";

export async function load(requestEvent: RequestEvent) {
	const authenticatedUser = await validateUser(requestEvent);

	if (!authenticatedUser) {
		console.log('User not authenticated');
		throw redirect(302, '/');
	}

	const userPermissions: Permission[] = await getPermissionsByUserId(authenticatedUser.id);
	const hasAdminAccess = userPermissions.some(permission => permission.name === 'access_admin_panel');
	if (!hasAdminAccess) {
		console.log('User does not have permission to access the admin panel');
		throw redirect(302, '/');
	}

    // Check for unread private messages
    const hasUnreadMessages = await checkUnreadPrivateMessagesByUserId(authenticatedUser.id);

	// Fetch all roles, permissions, and role-permissions
	const roles: Role[] = await getAllRoles();
	const permissions: Permission[] = await getAllPermissions();
	const rolePermissions: RolePermission[] = await getAllRolePermissions();

	return {
		username: authenticatedUser.username,
		userid: authenticatedUser.id,
		userPermissions,
        roles,
        permissions,
        rolePermissions,
        hasUnreadMessages,  // Add this line
	};
}
