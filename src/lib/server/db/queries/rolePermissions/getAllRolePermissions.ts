// src/lib/server/db/queries/role_permissions/getAllRolePermissions.ts

import { pool } from "$lib/server";
import type { RolePermission } from "$lib/shared";

export async function getAllRolePermissions(): Promise<RolePermission[]> {
	const client = await pool.connect();
	try {
		const rolePermissionsResult = await client.query(`
            SELECT role_id, permission_id
            FROM role_permissions
        `);

		return rolePermissionsResult.rows;
	} catch (error) {
		console.error('Error fetching role permissions:', error);
		throw error;
	} finally {
		client.release();
	}
}
