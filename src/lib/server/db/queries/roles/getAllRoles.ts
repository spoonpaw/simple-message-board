// src/lib/server/db/queries/roles/getAllRoles.ts

import { pool } from "$lib/server";
import type { Role } from "$lib/shared";

export async function getAllRoles(): Promise<Role[]> {
	const client = await pool.connect();
	try {
		const rolesResult = await client.query(`
            SELECT id, name, hierarchy_level, is_default
            FROM roles
        `);

		return rolesResult.rows;
	} catch (error) {
		console.error('Error fetching roles:', error);
		throw error;
	} finally {
		client.release();
	}
}
