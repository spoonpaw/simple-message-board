<script lang="ts">
	import type {Role} from "$lib/shared";
	import Modal from "$lib/client/components/common/Modal.svelte";
	import {createEventDispatcher} from "svelte";
	import {Icon} from '@steeze-ui/svelte-icon';
	import {Pencil, Trash2} from '@steeze-ui/lucide-icons';

	export let roles: Role[] = [];
	let showCreateRoleModal = false;
	let newRoleName = '';
	let newRoleHierarchyLevel = ''; // Starts as an empty string
	let newRoleIsDefault = false;
	const dispatch = createEventDispatcher();

	function handleEdit(roleId: string) {
		// Your edit logic here
		console.log('Edit role with ID:', roleId);
	}

	// Function for handling delete
	async function handleDelete(roleId: string) {
		try {
			const response = await fetch(`/role/${roleId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const updatedRoles = await response.json();
			console.log('Role deleted successfully:', updatedRoles);

			// Dispatch the event with the updated roles
			dispatch('rolesupdated', { roles: updatedRoles });
		} catch (error) {
			console.error('Error deleting role:', error);
			// Optionally, show an error message to the user
		}
	}


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

<div class="flex flex-wrap justify-center gap-6 items-stretch">
    {#each roles as role}
        <div class="block w-full md:w-1/2 lg:w-1/3 p-4 relative group">
            <div class="bg-gray-100 shadow-lg rounded-lg p-6 transition duration-150 ease-in-out hover:shadow-xl cursor-default h-full flex flex-col">
                <!-- Edit Icon -->
                <button
                        on:click={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleEdit(role.id);
                        }}
                        class="focus:outline-none hover:bg-blue-200 p-1 rounded-md absolute top-6 right-6"
                        title="Edit Role"
                >
                    <Icon src={Pencil} class="w-4 h-4 text-blue-500"/>
                </button>
                <!-- Delete Icon -->
                <button
                        on:click={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleDelete(role.id);
                        }}
                        class="focus:outline-none hover:bg-red-200 p-1 rounded-md absolute top-6 right-12"
                        title="Delete Role"
                >
                    <Icon src={Trash2} class="w-4 h-4 text-red-500"/>
                </button>
                <h2 class="text-xl font-semibold text-blue-600 mb-2">{role.name}</h2>
                <p class="text-gray-600 mb-4 flex-grow">
                    Hierarchy Level: {role.hierarchy_level}
                </p>
            </div>
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
