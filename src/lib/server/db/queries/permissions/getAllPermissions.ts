// src/lib/server/db/queries/permissions/getAllPermissions.ts

import { pool } from "$lib/server";
import type { Permission } from "$lib/shared";

export async function getAllPermissions(): Promise<Permission[]> {
	const client = await pool.connect();
	try {
		const permissionsResult = await client.query(`
            SELECT id, name, description
            FROM permissions
            ORDER BY name ASC
        `);

		return permissionsResult.rows;
	} catch (error) {
		console.error('Error fetching permissions:', error);
		throw error;
	} finally {
		client.release();
	}
}
