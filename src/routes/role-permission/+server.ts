// src/routes/role-permission/+server.ts

import type {RequestEvent} from '@sveltejs/kit';
import {validateUser} from '$lib/server/auth';
import type {RolePermission} from '$lib/shared';
import {getPermissionsByUserId} from "$lib/server/db/queries/permissions/getPermissionsByUserId";
import {getAllRolePermissions} from "$lib/server/db/queries/rolePermissions/getAllRolePermissions";
import {updateRolePermissions} from "$lib/server/db/queries/rolePermissions/updateRolePermissions";

export async function POST(requestEvent: RequestEvent) {
	try {
		const user = await validateUser(requestEvent);
		if (!user) {
			console.error('User not authenticated');
			return new Response(null, {status: 401}); // Unauthorized
		}

		// Check if the user has permission to update role permissions
		const userPermissions = await getPermissionsByUserId(user.id);
		const canModifyRolePermissions = userPermissions.some(permission => permission.name === 'modify_role_permissions');
		if (!canModifyRolePermissions) {
			console.error('User does not have permission to modify role permissions');
			return new Response(null, {status: 403}); // Forbidden
		}

		// Get the role permissions from the request
		const request = requestEvent.request;
		const updatedRolePermissions: RolePermission[] = await request.json();

        // Fetch the current role permissions
        const currentRolePermissions = await getAllRolePermissions();

        // Sort both arrays for a consistent comparison
        const sortFn = (a: RolePermission, b: RolePermission) =>
            a.role_id.localeCompare(b.role_id) || a.permission_id.localeCompare(b.permission_id);
        updatedRolePermissions.sort(sortFn);
        currentRolePermissions.sort(sortFn);

        // Check if the updated role permissions are exactly the same as the current ones
        const isSame = updatedRolePermissions.length === currentRolePermissions.length &&
            updatedRolePermissions.every((rp, index) =>
                rp.role_id === currentRolePermissions[index].role_id && rp.permission_id === currentRolePermissions[index].permission_id
            );

        if (isSame) {
            console.log('No changes detected in role permissions');
            return new Response(JSON.stringify({ message: "No changes were detected." }), {
                status: 200, // Or consider using a different status code to indicate no change
                headers: {'Content-Type': 'application/json'}
            });
        }

        // If there are changes, update the role permissions in the database
		await updateRolePermissions(updatedRolePermissions);
		console.log('Role permissions updated successfully');

        // Fetch and return the updated role permissions
		const rolePermissions = await getAllRolePermissions();
		return new Response(JSON.stringify(rolePermissions), {
			status: 200,
			headers: {'Content-Type': 'application/json'}
		});
	} catch (error) {
		console.error('Error handling role permissions:', error);
		return new Response(null, {status: 500});
	}
}
