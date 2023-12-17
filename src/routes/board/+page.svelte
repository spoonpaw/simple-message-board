<!--src/routes/board/+page.svelte-->

<script lang="ts">
	import type {PageServerData} from './$types';
	import type {Category, Permission} from '$lib/shared';
	import {goto} from '$app/navigation';
	import {Icon} from '@steeze-ui/svelte-icon';
	import {Home, Pencil, Trash2} from '@steeze-ui/lucide-icons';
	import Modal from "$lib/client/components/common/Modal.svelte";
	import {fade} from 'svelte/transition';
	import Navbar from "$lib/client/components/common/Navbar.svelte";
	import { unreadMessagesStore } from '$lib/client/stores/unreadMessagesStore';

	export let data: PageServerData;
	let username = data.username;
	let userid = data.userid;
	let categories: Category[] = data.categories;
	let permissions: Permission[] = data.permissions;
	let isLoggedIn = !!data.userid;
	let hasUnreadMessages = data.hasUnreadMessages;
	unreadMessagesStore.set(hasUnreadMessages);

	// Initialize permission flags
	let canCreateCategory = false;
	let canDeleteCategory = false;
	let canModifyCategory = false;
	let canAccessAdminPanel = false;

	let newCategoryModal = false;
	let newCategoryTitle = '';
	let newCategoryDescription = '';

	let newCategoryErrorMessage = '';
	let newCategoryErrorTimeout: number;

	let editCategoryModal = false;
	let editingCategoryId = '';
	let editCategoryTitle = '';
	let editCategoryDescription = '';
	let editCategoryErrorMessage = '';
	let editCategoryErrorTimeout: number;

	// Check for permissions
	if (permissions) {
		canCreateCategory = permissions.some(permission => permission.name === 'create_category');
		canDeleteCategory = permissions.some(permission => permission.name === 'delete_category');
		canModifyCategory = permissions.some(permission => permission.name === 'modify_category');
		canAccessAdminPanel = permissions.some(permission => permission.name === 'access_admin_panel');
	}

	async function submitEditCategory(event: SubmitEvent) {
		event.preventDefault();

		// Basic validation
		if (editCategoryTitle.trim().length === 0) {
			showEditCategoryError('Category title cannot be empty');
			return;
		}

		if (editCategoryTitle.length > 30) {
			showEditCategoryError('Category title must be less than 30 characters');
			return;
		}

		if (editCategoryDescription.trim().length === 0) {
			showEditCategoryError('Category description cannot be empty');
			return;
		}

		if (editCategoryDescription.length > 200) {
			showEditCategoryError('Category description must be less than 200 characters');
			return;
		}

		// Proceed with submitting the edited category data to the server
		const response = await fetch(`/category/${editingCategoryId}`, {
			method: 'PUT', // Assuming 'PUT' method for editing
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				title: editCategoryTitle,
				description: editCategoryDescription
			})
		});

		if (response.ok) {
			const updatedCategories = await response.json();
			categories = updatedCategories; // Update categories list
			closeEditCategoryModal();
		} else {
			const errorResponse = await response.json();
			const errorMessage = errorResponse.error || 'Failed to edit category';
			console.error(errorMessage);
			showEditCategoryError(errorMessage);
		}
	}

	function showEditCategoryError(message: string) {
		editCategoryErrorMessage = message;
		if (editCategoryErrorTimeout) {
			clearTimeout(editCategoryErrorTimeout);
		}
		editCategoryErrorTimeout = setTimeout(() => {
			editCategoryErrorMessage = '';
		}, 5000) as unknown as number; // Clear the edit category error message after 5 seconds
	}

	function showNewCategoryError(message: string) {
		newCategoryErrorMessage = message;
		if (newCategoryErrorTimeout) {
			clearTimeout(newCategoryErrorTimeout);
		}
		newCategoryErrorTimeout = setTimeout(() => {
			newCategoryErrorMessage = '';
		}, 5000) as unknown as number;  // Clear the new category error message after 5 seconds
	}

	function openNewCategoryModal() {
		newCategoryModal = true;
	}

	function closeNewCategoryModal() {
		newCategoryModal = false;
		newCategoryTitle = '';
		newCategoryDescription = '';
	}

	function navigateToHome() {
		goto('/');
	}

	async function handleDeleteCategory(event: MouseEvent, categoryId: string) {
		event.preventDefault();
		event.stopPropagation();

		console.log(`Trash button pressed for category id: ${categoryId}`);

		// Call the server-side endpoint to delete the category
		const response = await fetch(`/category/${categoryId}`, {
			method: 'DELETE',
		});

		if (response.ok) {
			console.log(`Category ${categoryId} deleted`);
			const updatedCategories = await response.json();
			categories = updatedCategories; // Update the categories array with the new list
		} else {
			console.error(`Failed to delete category ${categoryId}`);
		}
	}

	function closeEditCategoryModal() {
		editCategoryModal = false;
		editingCategoryId = '';
		editCategoryTitle = '';
		editCategoryDescription = '';
		editCategoryErrorMessage = ''; // Also clear any error message
		if (editCategoryErrorTimeout) {
			clearTimeout(editCategoryErrorTimeout);
		}
	}

	function openEditCategoryModal(categoryId: string, title: string, description: string) {
		editingCategoryId = categoryId;
		editCategoryTitle = title;
		editCategoryDescription = description;
		editCategoryModal = true;
	}

	async function submitNewCategory(event: SubmitEvent) {
		event.preventDefault();

		// Basic validation
		if (newCategoryTitle.trim().length === 0) {
			showNewCategoryError('Category title cannot be empty');
			return;
		}

		if (newCategoryTitle.length > 30) {
			showNewCategoryError('Category title must be less than 30 characters');
			return;
		}

		if (newCategoryDescription.length > 200) {
			showNewCategoryError('Category description must be less than 200 characters');
			return;
		}

		// Proceed with submitting the new category data to the server
		const response = await fetch('/category', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				title: newCategoryTitle,
				description: newCategoryDescription
			})
		});

		if (response.ok) {
			const updatedCategories = await response.json();
			categories = updatedCategories; // Update categories list
			closeNewCategoryModal();
		} else {
			console.error('Failed to create new category');
			showNewCategoryError('Failed to create new category');
		}
	}

</script>

<svelte:head>
    <title>Simple Message Board - Main Board</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
    <div class="container mx-auto py-8 px-4 sm:px-0">
        <!-- Navbar Component -->
        <Navbar
            iconSrc={Home}
            text="Home"
            onIconClick={navigateToHome}
            {isLoggedIn}
            {username}
            {canAccessAdminPanel}
            userId={userid ?? ''}
        />

        <!-- Message Board Header -->
        <h1 class="text-3xl font-semibold text-gray-800 mt-2 mb-6">Message Board</h1>

        {#if canCreateCategory}
            <div class="flex justify-end px-4">
                <button
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                        on:click={openNewCategoryModal}
                >New Category
                </button>
            </div>
        {/if}

        <div class="flex flex-wrap justify-center gap-6 items-stretch">
            {#each categories as category (category.id)}
                <div class="block w-full md:w-1/2 lg:w-1/3 p-4 relative group">
                    <a
                            href={`/category/${category.id}`}
                            class="bg-white shadow-lg rounded-lg p-6 transition duration-150 ease-in-out hover:shadow-xl cursor-pointer h-full flex flex-col"
                    >
                        {#if canDeleteCategory}
                            <button
                                    on:click={(event) => handleDeleteCategory(event, category.id)}
                                    class="focus:outline-none hover:bg-red-100 p-1 rounded absolute top-6 right-6"
                                    title="Delete Category"
                            >
                                <Icon src={Trash2} class="w-4 h-4 text-red-500"/>
                            </button>
                        {/if}
                        {#if canModifyCategory}
                            <button
                                    on:click={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        openEditCategoryModal(category.id, category.title, category.description);
                                    }}
                                    class="focus:outline-none hover:bg-blue-100 p-1 rounded absolute top-6 right-12"
                                    title="Edit Category"
                            >
                                <Icon src={Pencil} class="w-4 h-4 text-blue-500"/>
                            </button>
                        {/if}
                        <h2 class="text-xl font-semibold text-blue-600 mb-2">{category.title}</h2>
                        <p class="text-gray-600 mb-4 flex-grow">
                            {category.description || 'No description provided.'}
                        </p>
                    </a>
                </div>
            {/each}
        </div>
    </div>
</div>

{#if newCategoryModal}
    <Modal open={newCategoryModal} title="Create New Category" on:close={closeNewCategoryModal}>
        <div slot="body">
            <form on:submit={submitNewCategory}>
                <!-- Title input with character counter -->
                <input
                        type="text"
                        bind:value={newCategoryTitle}
                        placeholder="Category Title"
                        class="w-full p-2 border rounded mb-1"
                        required
                        maxlength="30"
                />
                <p class={`mb-3 text-sm ${newCategoryTitle.length > 30 ? 'text-red-500' : 'text-gray-600'}`}>
                    {newCategoryTitle.length}/30
                </p>

                <!-- Description textarea with character counter -->
                <textarea
                        bind:value={newCategoryDescription}
                        placeholder="Category Description"
                        class="w-full p-2 border rounded mb-1"
                        rows="3"
                        maxlength="200"
                ></textarea>
                <p class={`mb-3 text-sm ${newCategoryDescription.length > 200 ? 'text-red-500' : 'text-gray-600'}`}>
                    {newCategoryDescription.length}/200
                </p>

                {#if newCategoryErrorMessage}
                    <p transition:fade={{ duration: 1000 }}
                       class="text-red-500 mb-2">
                        {newCategoryErrorMessage}
                    </p>
                {/if}

                <div class="flex justify-end mt-4">
                    <button
                            type="button"
                            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            on:click={closeNewCategoryModal}
                    >
                        Cancel
                    </button>
                    <button
                            type="submit"
                            class="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Create
                    </button>
                </div>
            </form>
        </div>
    </Modal>
{/if}

{#if editCategoryModal}
    <Modal open={editCategoryModal} title="Edit Category" on:close={closeEditCategoryModal}>
        <div slot="body">
            <form on:submit={submitEditCategory}>
                <!-- Title input with character counter -->
                <input
                        type="text"
                        bind:value={editCategoryTitle}
                        placeholder="Category Title"
                        class="w-full p-2 border rounded mb-1"
                        required
                        maxlength="30"
                />
                <p class={`mb-3 text-sm ${editCategoryTitle.length > 30 ? 'text-red-500' : 'text-gray-600'}`}>
                    {editCategoryTitle.length}/30
                </p>

                <!-- Description textarea with character counter -->
                <textarea
                        bind:value={editCategoryDescription}
                        placeholder="Category Description"
                        class="w-full p-2 border rounded mb-1"
                        rows="3"
                        maxlength="200"
                ></textarea>
                <p class={`mb-3 text-sm ${editCategoryDescription.length > 200 ? 'text-red-500' : 'text-gray-600'}`}>
                    {editCategoryDescription.length}/200
                </p>

                {#if editCategoryErrorMessage}
                    <p transition:fade={{ duration: 1000 }} class="text-red-500 mb-2">
                        {editCategoryErrorMessage}
                    </p>
                {/if}

                <div class="flex justify-end mt-4">
                    <button
                            type="button"
                            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            on:click={closeEditCategoryModal}
                    >
                        Cancel
                    </button>
                    <button
                            type="submit"
                            class="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Update
                    </button>
                </div>
            </form>
        </div>
    </Modal>
{/if}
