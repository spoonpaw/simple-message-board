// src/routes/admin/$types.d.ts

export interface PageServerData {
	username: string;
	userid: string;
	userPermissions: Permission[],
	roles: Role[],
	permissions:	Permission[],
	rolePermissions:	RolePermission[],
}
