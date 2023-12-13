// src/lib/server/db/queries/rolePermissions/updateRolePermissions.ts

import type {RolePermission} from '$lib/shared';
import {pool} from '$lib/server';

export async function updateRolePermissions(updatedRolePermissions: RolePermission[]): Promise<void> {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		// Flatten role permissions for parameterized query
		const flattenedPermissions = updatedRolePermissions.flatMap(p => [p.role_id, p.permission_id]);

		// Generate parameterized placeholders
		const paramPlaceholders = updatedRolePermissions.map((_, index) => `($${index * 2 + 1}::uuid, $${index * 2 + 2}::uuid)`).join(', ');

		// Step 1: Delete permissions not in the updated list
		await client.query(`
            DELETE FROM role_permissions
            WHERE (role_id, permission_id) NOT IN (VALUES ${paramPlaceholders})
        `, flattenedPermissions);

		// Step 2: Insert new permissions
		// This query will ignore insertions for existing role_permission combinations due to the ON CONFLICT clause
		await client.query(`
            INSERT INTO role_permissions (role_id, permission_id)
            SELECT * FROM UNNEST ($1::uuid[], $2::uuid[])
            AS t(role_id, permission_id)
            ON CONFLICT (role_id, permission_id) DO NOTHING
        `, [flattenedPermissions.filter((_, i) => i % 2 === 0), flattenedPermissions.filter((_, i) => i % 2 !== 0)]);

		await client.query('COMMIT');
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}
