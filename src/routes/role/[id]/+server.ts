// src/routes/role/[id]/+server.ts

import type {RequestEvent} from "@sveltejs/kit";
import {validateUser} from "$lib/server/auth";
import {getPermissionsByUserId} from "$lib/server/db/queries/permissions/getPermissionsByUserId";
import {getUserCountByRoleId} from "$lib/server/db/queries/users/getUserCountByRoleId";
import {deleteRole} from "$lib/server/db/queries/roles/deleteRole";
import {getAllRoles} from "$lib/server/db/queries/roles/getAllRoles";

export async function DELETE(requestEvent: RequestEvent) {
	try {
		// Validate the user
		const user = await validateUser(requestEvent);
		if (!user) {
			console.error('User not authenticated');
			return new Response(null, {status: 401}); // Unauthorized
		}

		// Check if the user has permission to delete roles
		const userPermissions = await getPermissionsByUserId(user.id);
		const canDeleteRoles = userPermissions.some(permission => permission.name === 'modify_roles');
		if (!canDeleteRoles) {
			console.error('User does not have permission to delete roles');
			return new Response(null, {status: 403}); // Forbidden
		}

		// Extract the role ID from the URL and ensure it's defined
		const roleId = requestEvent.params.id;
		if (!roleId) {
			console.error('Role ID is undefined');
			return new Response(null, {status: 400}); // Bad Request
		}

		// Check if there are users associated with the role
		const userCount = await getUserCountByRoleId(roleId);
		if (userCount > 0) {
			console.error('Cannot delete role as it is associated with users');
			return new Response(JSON.stringify({ error: 'Role is associated with users and cannot be deleted.' }), { status: 403 });
		}

		// Delete the role
		await deleteRole(roleId);
		const allRoles = await getAllRoles();

		// Return the updated list of roles
		return new Response(JSON.stringify(allRoles), {
			status: 200,
			headers: {'Content-Type': 'application/json'}
		});
	} catch (error) {
		console.error('Error handling role deletion: ', error);
		return new Response(null, {status: 500}); // Internal Server Error
	}
}
