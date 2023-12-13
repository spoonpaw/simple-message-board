// src/routes/role/[id]/+server.ts

import type {RequestEvent} from "@sveltejs/kit";
import {validateUser} from "$lib/server/auth";
import {getPermissionsByUserId} from "$lib/server/db/queries/permissions/getPermissionsByUserId";
import {getUserCountByRoleId} from "$lib/server/db/queries/users/getUserCountByRoleId";
import {deleteRole} from "$lib/server/db/queries/roles/deleteRole";
import {getAllRoles} from "$lib/server/db/queries/roles/getAllRoles";
import {updateRole} from "$lib/server/db/queries/roles/updateRole";
import {getRoleById} from "$lib/server/db/queries/roles/getRoleById";


export async function PUT(requestEvent: RequestEvent) {
	try {
		// Validate the user
		const user = await validateUser(requestEvent);
		if (!user) {
			console.error('User not authenticated');
			return new Response(null, { status: 401 }); // Unauthorized
		}

		// Check if the user has permission to modify roles
		const userPermissions = await getPermissionsByUserId(user.id);
		const canModifyRoles = userPermissions.some(permission => permission.name === 'modify_roles');
		if (!canModifyRoles) {
			console.error('User does not have permission to modify roles');
			return new Response(null, { status: 403 }); // Forbidden
		}

		// Extract the role ID from the URL
		const roleId = requestEvent.params.id;
		if (!roleId) {
			console.error('Role ID is undefined');
			return new Response(null, { status: 400 }); // Bad Request
		}

		// Parse the request body to get the updated role data
		const requestData = await requestEvent.request.json();
		const updatedRoleData = {
			name: requestData.name,
			hierarchy_level: requestData.hierarchyLevel,
			is_default: requestData.isDefault
		};

    // Retrieve current role data
    const currentRole = await getRoleById(roleId);
    if (!currentRole) {
        return new Response(null, { status: 404 }); // Not Found
    }

    // Check if the role data is unchanged
    if (currentRole.name === updatedRoleData.name &&
        currentRole.hierarchy_level === updatedRoleData.hierarchy_level &&
        currentRole.is_default === updatedRoleData.is_default) {
        // No change detected
        return new Response(JSON.stringify({ message: "No changes were detected." }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

		// Update the role
		await updateRole(roleId, updatedRoleData);
		const allRoles = await getAllRoles();

		// Return the updated list of roles
		return new Response(JSON.stringify(allRoles), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error handling role update: ', error);
		return new Response(null, { status: 500 }); // Internal Server Error
	}
}

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
