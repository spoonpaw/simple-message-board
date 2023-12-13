// src/lib/server/db/queries/users/getUserCountByRoleId.ts

import { pool } from '$lib/server';

export async function getUserCountByRoleId(roleId: string): Promise<number> {
	const client = await pool.connect();

	try {
		const query = `
            SELECT COUNT(*)
            FROM users
            WHERE role_id = $1;
        `;
		const values = [roleId];

		const res = await client.query(query, values);
		return parseInt(res.rows[0].count);
	} finally {
		client.release();
	}
}
