<!--src/routes/admin/+page.svelte-->

<script lang="ts">
	import RolesPanel from '$lib/client/components/adminPanel/RolesPanel.svelte';
	import RolePermissionsPanel from '$lib/client/components/adminPanel/RolePermissionsPanel.svelte';
	import type {PageServerData} from './$types';
	import {Home} from "@steeze-ui/lucide-icons";
	import type {Role, RolePermission} from "$lib/shared";
	import Navbar from "$lib/client/components/common/Navbar.svelte";
	import {goto} from "$app/navigation";

	export let data: PageServerData;

	let {roles, permissions, rolePermissions, username, userid} = data;

	let activeTab = 'roles';

	function handlePermissionChange(event: CustomEvent<{ roleId: string; permissionId: string; newState: boolean }>) {
		const { roleId, permissionId, newState } = event.detail;
		console.log(`Received permission change. Role ID: ${roleId}, Permission ID: ${permissionId}, New State: ${newState}`);

		if (newState) {
			// Add or update the permission
			let existingPermissionIndex = rolePermissions.findIndex(rp => rp.role_id === roleId && rp.permission_id === permissionId);
			if (existingPermissionIndex !== -1) {
				rolePermissions[existingPermissionIndex] = { role_id: roleId, permission_id: permissionId, permission: newState };
			} else {
				rolePermissions = [...rolePermissions, { role_id: roleId, permission_id: permissionId, permission: newState }];
			}
		} else {
			// Remove the permission
			rolePermissions = rolePermissions.filter(rp => !(rp.role_id === roleId && rp.permission_id === permissionId));
		}

		console.log('Updated rolePermissions:', rolePermissions);
	}

	function handleUpdatePermissions(event: CustomEvent<RolePermission[]>) {
		rolePermissions = event.detail;
	}

	function handleRolesUpdated(event: CustomEvent<{ roles: Role[] }>) {
		roles = event.detail.roles;
		console.log('Roles updated:', roles);
	}


	function navigateToHome() {
		goto('/');
	}

</script>

<svelte:head>
    <title>Admin Panel</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
    <div class="container mx-auto py-8 px-4 sm:px-0">
        <!-- Navbar Component -->
        <Navbar
            iconSrc={Home}
            text="Home"
            onIconClick={navigateToHome}
                    isLoggedIn={true}
                    username={username}
                    userId={userid}
                    canAccessAdminPanel={true}
            />

        <div class="bg-white shadow-2xl rounded-3xl overflow-hidden">
            <h1 class="text-3xl font-semibold text-gray-800 px-6 py-4">
                Admin Dashboard
            </h1>
            <div class="flex justify-center bg-gradient-to-r from-blue-500 to-teal-400 p-1 rounded-t-3xl">
                <button
                        class={`mx-1 px-6 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'roles' ? 'bg-white text-gray-800 shadow-lg' : 'bg-transparent text-white hover:bg-white hover:text-gray-800'}`}
                        on:click={() => activeTab = 'roles'}>
                    Roles
                </button>
                <button
                        class={`mx-1 px-6 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === 'rolePermissions' ? 'bg-white text-gray-800 shadow-lg' : 'bg-transparent text-white hover:bg-white hover:text-gray-800'}`}
                        on:click={() => activeTab = 'rolePermissions'}>
                    Role Permissions
                </button>
            </div>

            <div class="p-6 bg-gray-50 rounded-b-3xl">
                {#if activeTab === 'roles'}
                    <RolesPanel
                    {roles}
                    on:rolesupdated={handleRolesUpdated}
                    />
                {:else if activeTab === 'rolePermissions'}
                    <RolePermissionsPanel
                            {rolePermissions}
                            {roles}
                            {permissions}
                            on:permissionchange={handlePermissionChange}
                            on:updatepermissions={handleUpdatePermissions}
                    />
                {/if}
            </div>
        </div>
    </div>
</div>
