// src/lib/server/db/queries/permissions/getPermissionsByUserId.ts

import {pool} from "$lib/server";
import type {Permission} from "$lib/shared";

export async function getUserPermissionsByUserId(userId: string): Promise<Permission[]> {
	const client = await pool.connect();
	try {
		const permissionsResult = await client.query(
			`
        SELECT p.id, p.name, p.description
        FROM users u
        INNER JOIN roles r ON u.role_id = r.id
        INNER JOIN role_permissions rp ON r.id = rp.role_id
        INNER JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = $1
      `,
			[userId]
		);

		return permissionsResult.rows;
	} catch (error) {
		console.error('Error fetching user permissions:', error);
		throw error;
	} finally {
		client.release();
	}
}
