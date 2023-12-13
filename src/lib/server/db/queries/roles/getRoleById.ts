// src/lib/server/db/queries/roles/getRoleById.ts

import { pool } from '$lib/server';
import type {Role} from "$lib/shared"; // Ensure you have a pool for PostgreSQL connection

export async function getRoleById(roleId: string): Promise<Role | null> {
	const client = await pool.connect();

	try {
		const query = `
            SELECT * FROM roles
            WHERE id = $1;
        `;
		const values = [roleId];

		const res = await client.query(query, values);

		if (res.rows.length === 0) {
			return null; // No role found with the given ID
		}

		return res.rows[0]; // Return the found role
	} finally {
		client.release();
	}
}
