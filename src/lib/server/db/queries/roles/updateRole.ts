// src/lib/server/db/queries/roles/updateRole.ts
import { pool } from '$lib/server'; // Assuming you have a pool for PostgreSQL connection

export async function updateRole(roleId: string, roleData: { name: string; hierarchy_level: number; is_default: boolean; }): Promise<void> {
	const client = await pool.connect();

	try {
		// If the role is being set to default, unset default for all other roles
		if (roleData.is_default) {
			const unsetDefaultQuery = 'UPDATE roles SET is_default = FALSE WHERE is_default = TRUE;';
			await client.query(unsetDefaultQuery);
		}

		// Prepare the query for updating the specified role
		const updateQuery = `
            UPDATE roles
            SET name = $1, hierarchy_level = $2, is_default = $3
            WHERE id = $4;
        `;
		const values = [roleData.name, roleData.hierarchy_level, roleData.is_default, roleId];

		// Execute the update query
		await client.query(updateQuery, values);
	} finally {
		client.release();
	}
}
