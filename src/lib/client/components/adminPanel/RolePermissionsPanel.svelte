<!--src/lib/client/components/adminPanel/RolePermissionsPanel.svelte-->

<script lang="ts">
	import type {RolePermission, Role, Permission} from '$lib/shared';

	import {createEventDispatcher} from 'svelte';
	import {toastManager} from "../../../../stores/toastManager";
	import ToastContainer from "$lib/client/components/common/ToastContainer.svelte";

	export let rolePermissions: RolePermission[];
	export let roles: Role[];
	export let permissions: Permission[];

	const dispatch = createEventDispatcher();

	type RolePermissionMap = {
		[roleId: string]: {
			[permissionId: string]: boolean;
		};
	};

	let rolePermissionMap: RolePermissionMap = {};

	// Reactive statement to initialize rolePermissionMap
	$: rolePermissionMap = roles.reduce((acc: RolePermissionMap, role) => {
		acc[role.id] = permissions.reduce((permAcc: { [permissionId: string]: boolean }, permission) => {
			permAcc[permission.id] = rolePermissions.some(rp => rp.role_id === role.id && rp.permission_id === permission.id);
			return permAcc;
		}, {});
		return acc;
	}, {});


	function togglePermission(roleId: string, permissionId: string): void {
		const newState = !rolePermissionMap[roleId][permissionId];

		// Temporarily hold the updated permissions for the role
		const updatedPermissions = {
			...rolePermissionMap[roleId],
			[permissionId]: newState
		};

		// Update rolePermissionMap to trigger reactivity
		rolePermissionMap = {...rolePermissionMap, [roleId]: updatedPermissions};

		console.log(`Permission toggled. Role ID: ${roleId}, Permission ID: ${permissionId}, New State: ${newState}`);

		// Dispatch the change event
		dispatch('permissionchange', {roleId, permissionId, newState});
	}


	async function saveChanges(): Promise<void> {
		// Convert rolePermissionMap to RolePermission[] format
		let updatedRolePermissions: RolePermission[] = [];
		for (const [roleId, permissions] of Object.entries(rolePermissionMap)) {
			for (const [permissionId, hasPermission] of Object.entries(permissions)) {
				if (hasPermission) {
					updatedRolePermissions.push({role_id: roleId, permission_id: permissionId});
				}
			}
		}

		try {
			const response = await fetch('/role-permission', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(updatedRolePermissions)
			});

			if (!response.ok) {
				throw new Error('Server error');
			}

			const result = await response.json();

			if (result.message && result.message === "No changes were detected.") {
				toastManager.addToast({
					message: 'No changes were detected.',
					type: 'info',
					duration: 3000
				});
			} else {
				dispatch('updatepermissions', result);
				toastManager.addToast({
					message: 'Changes saved successfully',
					type: 'success',
					duration: 3000
				});
			}
		} catch (error) {
			console.error('Error saving changes:', error);
			toastManager.addToast({
				message: 'Failed to save changes',
				type: 'error',
				duration: 3000
			});
		}
	}
</script>


<!-- Toast Notifications -->
<ToastContainer/>

<div>
    <h2 class="text-xl font-semibold">Role Permissions</h2>
    <div>
        {#each roles as role}
            <div class="border-t border-gray-200 p-4">
                <h3 class="font-semibold">{role.name}</h3>
                <div class="flex flex-wrap -mx-2">
                    {#each permissions as permission}
                        <div class="p-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                            <label class="flex items-center space-x-2">
                                <input type="checkbox"
                                       bind:checked={rolePermissionMap[role.id][permission.id]}
                                       on:change={() => togglePermission(role.id, permission.id)}/>
                                <span>{permission.name}</span>
                            </label>
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
    <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700" on:click={saveChanges}>
        Save Changes
    </button>
</div>
