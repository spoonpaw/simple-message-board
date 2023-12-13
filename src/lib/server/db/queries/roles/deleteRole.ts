// src/lib/server/db/queries/roles/deleteRole.ts

import { pool } from '$lib/server';

export async function deleteRole(roleId: string): Promise<void> {
	const client = await pool.connect();

	try {
		const deleteQuery = `
            DELETE FROM roles
            WHERE id = $1;
        `;
		const values = [roleId];

		await client.query(deleteQuery, values);
		// No return is necessary as we are only deleting the role
	} finally {
		client.release();
	}
}
