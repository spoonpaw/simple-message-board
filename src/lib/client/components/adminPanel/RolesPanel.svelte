<script lang="ts">
	import type {Role} from "$lib/shared";
	import Modal from "$lib/client/components/common/Modal.svelte";
	import {createEventDispatcher} from "svelte";
	import {Icon} from '@steeze-ui/svelte-icon';
	import {Pencil, Trash2} from '@steeze-ui/lucide-icons';
	import ToastContainer from "$lib/client/components/common/ToastContainer.svelte";
	import {toastManager} from "../../stores/toastManager";

	export let roles: Role[] = [];
	let showCreateRoleModal = false;
	let newRoleName = '';
	let newRoleHierarchyLevel = ''; // Starts as an empty string
	let newRoleIsDefault = false;
	const dispatch = createEventDispatcher();

	let showEditRoleModal = false;
	let editingRole: Role | null = null;
	let editRoleName = '';
	let editRoleHierarchyLevel = '';
	let editRoleIsDefault = false;


	function handleEdit(roleId: string) {
		const roleToEdit = roles.find(role => role.id === roleId);
		if (roleToEdit) {
			editingRole = {...roleToEdit};
			editRoleName = editingRole.name;
			editRoleHierarchyLevel = editingRole.hierarchy_level.toString();
			editRoleIsDefault = editingRole.is_default;
			showEditRoleModal = true;
		}
	}

	function closeEditModal() {
		editingRole = null;
		editRoleName = '';
		editRoleHierarchyLevel = '';
		editRoleIsDefault = false;
		showEditRoleModal = false;
	}

	// Update role logic here
	async function updateRole() {
		if (!editingRole) return;

		// Validate editRoleName is not empty
		if (!editRoleName.trim()) {
			return;
		}

		// Parse and validate editRoleHierarchyLevel
		const hierarchyLevel = parseInt(editRoleHierarchyLevel);
		if (!Number.isInteger(hierarchyLevel) || hierarchyLevel < 0) {
			return;
		}

		try {
			const response = await fetch(`/role/${editingRole.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: editRoleName,
					hierarchyLevel: hierarchyLevel,
					isDefault: editRoleIsDefault,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			// Handle the scenario where no changes were detected
			if (result.message && result.message === "No changes were detected.") {
				toastManager.addToast({
					message: 'No changes were detected.',
					type: 'info',
					duration: 3000
				});
			} else {
				console.log('Role updated successfully:', result);
				toastManager.addToast({
					message: 'Role updated successfully',
					type: 'success',
					duration: 3000
				});

				// Dispatch the event with the updated roles
				dispatch('rolesupdated', {roles: result});
			}

			closeEditModal(); // Reset the modal values
		} catch (error) {
			console.error('Error updating role:', error);
			toastManager.addToast({
				message: 'Error updating role',
				type: 'error',
				duration: 3000
			});
		}
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
				// Extract the error message from the server's response
				const errorResponse = await response.json();
				const errorMessage = errorResponse.error || `HTTP error! status: ${response.status}`;
				throw new Error(errorMessage);
			}

			const updatedRoles = await response.json();
			console.log('Role deleted successfully:', updatedRoles);

			toastManager.addToast({
				message: 'Role deleted successfully',
				type: 'success',
				duration: 3000
			});

			// Dispatch the event with the updated roles
			dispatch('rolesupdated', {roles: updatedRoles});
		} catch (error) {
			console.error('Error deleting role:', error);
			// Check if error is an instance of Error and then show the message
			const message = (error instanceof Error) ? error.message : 'Unknown error occurred';
			toastManager.addToast({
				message: message,
				type: 'error',
				duration: 3000
			});
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

			toastManager.addToast({
				message: 'Role created successfully',
				type: 'success',
				duration: 3000
			});

			// Dispatch the event with the updated roles
			dispatch('rolesupdated', {roles: updatedRoles});

			handleClose(); // Reset the modal values
		} catch (error) {
			console.error('Error creating role:', error);
			// Optionally, show an error message to the user
			toastManager.addToast({
				message: 'Error creating role',
				type: 'error',
				duration: 3000
			});
		}
	}

	// Function to close the modal
	function handleClose() {
		newRoleName = '';
		newRoleHierarchyLevel = ''; // Starts as an empty string
		newRoleIsDefault = false;
		showCreateRoleModal = false;
	}

	// Function to ensure only integer values are entered
	function handleNewRoleHierarchyLevelInput(event: Event) {
		const input = event.target as HTMLInputElement | null;
		if (input) {
			const value = input.value;
			newRoleHierarchyLevel = value.replace(/[^0-9]/g, ''); // Remove non-integer characters
		}
	}

	function handleEditRoleHierarchyLevelInput(event: Event) {
		const input = event.target as HTMLInputElement | null;
		if (input) {
			const value = input.value;
			editRoleHierarchyLevel = value.replace(/[^0-9]/g, ''); // Remove non-integer characters
		}
	}
</script>

<ToastContainer/>

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
                <div class="flex flex-col mb-2">
                    <div class="flex items-center space-x-2">
                        <h2 class="text-xl font-semibold text-blue-600">
                            {role.name}
                        </h2>
                        {#if role.is_default}
                            <span class="bg-green-500 text-white px-2 py-0.5 text-xs rounded-full">Default</span>
                        {/if}
                    </div>
                </div>
                <p class="text-gray-600 flex-grow">
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
                        on:input={handleNewRoleHierarchyLevelInput}/>
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

<Modal title="Edit Role" bind:open={showEditRoleModal} on:close={closeEditModal}>
    <div slot="body">
        <form on:submit|preventDefault={updateRole} class="bg-white rounded px-8 pt-6 pb-8 mb-4">
            <p class="text-lg text-gray-700 mb-4">Edit the details of the role:</p>

            <!-- Role Name Input -->
            <div class="mb-4">
                <label for="editRoleName" class="block text-gray-700 text-sm font-bold mb-2">Role Name</label>
                <input
                        id="editRoleName"
                        type="text"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        bind:value={editRoleName}/>
            </div>

            <!-- Hierarchy Level Input -->
            <div class="mb-4">
                <label for="editHierarchyLevel" class="block text-gray-700 text-sm font-bold mb-2">Hierarchy
                    Level</label>
                <input
                        id="editHierarchyLevel"
                        type="text"
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        bind:value={editRoleHierarchyLevel}
                        on:input={handleEditRoleHierarchyLevelInput}/>
            </div>

            <!-- Default Role Checkbox -->
            <div class="mb-6">
                <label for="editDefaultRole" class="block text-gray-700 text-sm font-bold mb-2">
                    <input
                            id="editDefaultRole"
                            type="checkbox"
                            class="mr-2 leading-tight"
                            bind:checked={editRoleIsDefault}/>
                    Default Role
                </label>
            </div>

            <!-- Buttons -->
            <div class="flex items-center justify-between">
                <button
                        type="button"
                        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        on:click={closeEditModal}>
                    Cancel
                </button>
                <button
                        type="submit"
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Update
                </button>
            </div>
        </form>
    </div>
</Modal>
