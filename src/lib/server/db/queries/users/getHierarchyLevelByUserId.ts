// src/lib/server/db/queries/users/getHierarchyLevelByUserId.ts

import { pool } from "$lib/server";
import type { QueryResult } from "pg";

export async function getHierarchyLevelByUserId(userId: string): Promise<number | null> {
	const client = await pool.connect();
	try {
		const hierarchyLevelResult: QueryResult = await client.query(
			`
            SELECT r.hierarchy_level
            FROM users u
            INNER JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
            `,
			[userId]
		);

		if (hierarchyLevelResult.rows.length > 0) {
			return hierarchyLevelResult.rows[0].hierarchy_level;
		} else {
			return null; // Return null if the user has no role or if the role has no hierarchy level
		}
	} catch (error) {
		console.error('Error fetching user hierarchy level:', error);
		throw error;
	} finally {
		client.release();
	}
}
