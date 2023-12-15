// src/routes/user/[id]/assign-role/+server.ts

import type {RequestEvent} from '@sveltejs/kit';
import {pool} from '$lib/server';
import {validateUser} from "$lib/server/auth";
import {getPermissionsByUserId} from '$lib/server/db/queries/permissions/getPermissionsByUserId';
import {getRoleById} from '$lib/server/db/queries/roles/getRoleById';

export async function PUT(requestEvent: RequestEvent) {
	const userId = requestEvent.params.id;

	if (!userId) {
		return new Response('User ID is required', {status: 400});
	}

	const requestData = await requestEvent.request.json();
	const newRoleId = requestData.roleId;

	let client;

	try {
		const user = await validateUser(requestEvent);

		if (!user) {
			return new Response(null, {status: 401}); // Unauthorized
		}

		const permissions = await getPermissionsByUserId(user.id);

		const canAssignRoles = permissions.some(p => p.name === 'assign_roles');
		if (!canAssignRoles) {
			return new Response(null, {status: 403}); // Forbidden
		}

		client = await pool.connect();

		const updateRoleResult = await client.query('UPDATE users SET role_id = $1 WHERE id = $2', [newRoleId, userId]);

		if (updateRoleResult.rowCount === 0) {
			client.release();
			return new Response(JSON.stringify({message: 'User not found'}), {
				status: 404,
				headers: {'Content-Type': 'application/json'}
			});
		}

		const updatedRole = await getRoleById(newRoleId);

		if (!updatedRole) {
			client.release();
			return new Response(JSON.stringify({message: 'Failed to retrieve updated role'}), {
				status: 500,
				headers: {'Content-Type': 'application/json'}
			});
		}

		client.release();
		return new Response(JSON.stringify({role: updatedRole}), {
			status: 200,
			headers: {'Content-Type': 'application/json'}
		});
	} catch (error) {
		if (client) client.release();
		return new Response(null, {status: 500});
	}
}
