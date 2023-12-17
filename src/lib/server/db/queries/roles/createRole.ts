// src/lib/server/db/queries/roles/createRole.ts

import { pool } from '$lib/server';
import type { Role } from "$lib/shared";

export async function createRole(newRole: Omit<Role, 'id'>): Promise<Role> {
	const client = await pool.connect();

	try {
        // If the new role is set to be the default, update all other roles
        if (newRole.is_default) {
            const unsetDefaultQuery = 'UPDATE roles SET is_default = FALSE WHERE is_default = TRUE;';
            await client.query(unsetDefaultQuery);
        }

		const insertQuery = `
            INSERT INTO roles (name, hierarchy_level, is_default)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
		const values = [newRole.name, newRole.hierarchy_level, newRole.is_default];

		const res = await client.query(insertQuery, values);
		return res.rows[0]; // Return the newly inserted role
	} finally {
		client.release();
	}
}
