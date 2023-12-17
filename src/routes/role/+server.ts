// src/routes/role/+server.ts

import type {RequestEvent} from "@sveltejs/kit";
import {validateUser} from "$lib/server/auth";
import {getPermissionsByUserId} from "$lib/server/db/queries/permissions/getPermissionsByUserId";
import type {Role} from "$lib/shared";
import {createRole} from "$lib/server/db/queries/roles/createRole";
import {getAllRoles} from "$lib/server/db/queries/roles/getAllRoles";

export async function POST(requestEvent: RequestEvent) {
	try {
		const user = await validateUser(requestEvent);
		if (!user) {
			console.error('User not authenticated');
			return new Response(null, {status: 401}); // Unauthorized
		}

		// Check if the user has permission to modify roles
		const userPermissions = await getPermissionsByUserId(user.id);
		const canModifyRoles = userPermissions.some(permission => permission.name === 'modify_roles');
		if (!canModifyRoles) {
			console.error('User does not have permission to modify roles');
			return new Response(null, {status: 403}); // Forbidden
		}

		// Parse the request body to get the role data
		const requestData = await requestEvent.request.json();
		const newRole: Omit<Role, 'id'> = {
			name: requestData.name,
			hierarchy_level: requestData.hierarchyLevel,
			is_default: requestData.isDefault
		};

		// Insert the new role
		await createRole(newRole);
		const allRoles = await getAllRoles();

		// Return success response
		return new Response(JSON.stringify(allRoles), {
			status: 200,
			headers: {'Content-Type': 'application/json'}
		});
	} catch (error) {
		console.error('Error handling role creation: ', error);
		return new Response(null, {status: 500}); // Internal Server Error
	}
}
