// src/lib/server/db/queries/users/getRoleByUserId.ts

import { pool } from "$lib/server";
import type { QueryResult } from "pg";

export async function getRoleByUserId(userId: string): Promise<Role | null> {
	const client = await pool.connect();
	try {
		const roleResult: QueryResult<Role> = await client.query(
			`
            SELECT r.id, r.name, r.hierarchy_level, r.is_default
            FROM users u
            INNER JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
            `,
			[userId]
		);

		if (roleResult.rows.length > 0) {
			return roleResult.rows[0];
		} else {
			return null; // Return null if the user has no role
		}
	} catch (error) {
		console.error('Error fetching user role:', error);
		throw error;
	} finally {
		client.release();
	}
}
