<script lang="ts">
	import type {Role} from "$lib/shared";
	import Modal from "$lib/client/components/common/Modal.svelte";
	import {createEventDispatcher} from "svelte";

	export let roles: Role[] = [];
	let showCreateRoleModal = false;
	let newRoleName = '';
	let newRoleHierarchyLevel = ''; // Starts as an empty string
	let newRoleIsDefault = false;
	const dispatch = createEventDispatcher();


	async function createRole() {
		// Validate newRoleName is not empty
		if (!newRoleName.trim()) {
			console.error('Role name cannot be empty.');
			// Optionally, show an error message to the user
			return;
		}

		// Parse and validate newRoleHierarchyLevel
		const hierarchyLevel = parseInt(newRoleHierarchyLevel);
		if (!Number.isInteger(hierarchyLevel) || hierarchyLevel < 0) {
			console.error('Hierarchy Level must be a non-negative integer.');
			// Optionally, show an error message to the user
			return;
		}


		try {
			const response = await fetch('/role', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: newRoleName,
					hierarchyLevel: hierarchyLevel,
					isDefault: newRoleIsDefault,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const updatedRoles = await response.json();
			console.log('Role created successfully:', updatedRoles);

			// Dispatch the event with the updated roles
			dispatch('rolesupdated', {roles: updatedRoles});

			showCreateRoleModal = false; // Close the modal after successful creation
		} catch (error) {
			console.error('Error creating role:', error);
			// Optionally, show an error message to the user
		}
	}

	// Function to close the modal
	function handleClose() {
		showCreateRoleModal = false;
	}

	// Function to ensure only integer values are entered
	function handleHierarchyLevelInput(event: Event) {
		const input = event.target as HTMLInputElement | null;
		if (input) {
			const value = input.value;
			newRoleHierarchyLevel = value.replace(/[^0-9]/g, ''); // Remove non-integer characters
		}
	}
</script>
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    {#each roles as role}
        <div class="p-4 bg-gray-100 rounded-lg shadow">
            <h2 class="font-semibold flex items-center">
                {role.name}
                {#if role.is_default}
                    <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default
                    </span>
                {/if}
            </h2>
            <p>Hierarchy Level: {role.hierarchy_level}</p>
        </div>
    {/each}
</div>

<div class="mt-4">
    <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            on:click={() => showCreateRoleModal = true}>
        Create New Role
    </button>
</div>

<Modal title="Create New Role" bind:open={showCreateRoleModal} on:close={handleClose}>
    <div slot="body">
        <form on:submit|preventDefault={createRole} class="bg-white rounded px-8 pt-6 pb-8 mb-4">
            <p class="text-lg text-gray-700 mb-4">Enter the details of the new role:</p>

            <!-- Role Name Input -->
            <div class="mb-4">
                <label for="roleName" class="block text-gray-700 text-sm font-bold mb-2">Role Name</label>
                <input
                        id="roleName"
                        type="text"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        bind:value={newRoleName}/>
            </div>

            <!-- Hierarchy Level Input -->
            <div class="mb-4">
                <label for="hierarchyLevel" class="block text-gray-700 text-sm font-bold mb-2">Hierarchy Level</label>
                <input
                        id="hierarchyLevel"
                        type="text"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        bind:value={newRoleHierarchyLevel}
                        on:input={handleHierarchyLevelInput}/>
            </div>

            <!-- Default Role Checkbox -->
            <div class="mb-6">
                <label for="defaultRole" class="block text-gray-700 text-sm font-bold mb-2">
                    <input
                            id="defaultRole"
                            type="checkbox"
                            class="mr-2 leading-tight"
                            bind:checked={newRoleIsDefault}/>
                    Default Role
                </label>
            </div>

            <!-- Buttons -->
            <div class="flex items-center justify-between">
                <button
                        type="button"
                        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        on:click={handleClose}>
                    Cancel
                </button>
                <button
                        type="submit"
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Submit
                </button>
            </div>

        </form>
    </div>
</Modal>
