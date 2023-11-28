<!-- src/routes/board/+page.svelte -->

<script lang="ts">
	// This import statement brings in the types for TypeScript.
	import type { PageServerData, Category } from './$types';
	import {goto} from '$app/navigation';

	// This prop will be populated with the data returned from `+page.server.ts`.
	export let data: PageServerData;

	// Now `username` will be populated with the value from the `load` function
	let username = data.username;

	// Use the categories received from the server
	let categories: Category[] = data.categories;

	async function logout() {
		// Call the logout endpoint
		const response = await fetch('/logout', { method: 'GET' });

		// Check if the logout was successful
		if (response.ok) {
			// Redirect to the login page
			await goto('/');
		} else {
			// Handle any errors if needed
			console.error('Logout failed');
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
    <div class="container mx-auto py-8 px-4 sm:px-0">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-semibold text-gray-800">Message Board</h1>

            <div>
                <div class="text-lg text-gray-600">Hi {username}!</div>
                <button
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                        on:click={logout}
                >
                    Logout
                </button>
            </div>


        </div>
        <div class="flex flex-wrap justify-center gap-6 items-stretch">
            {#each categories as category (category.id)}
                <a href={`/category/${category.id}`} class="block w-full md:w-1/2 lg:w-1/3 p-4">
                    <div class="bg-white shadow-lg rounded-lg p-6 transition duration-150 ease-in-out hover:shadow-xl cursor-pointer h-full flex flex-col">
                        <h2 class="text-xl font-semibold text-blue-600 mb-2">{category.title}</h2>
                        <p class="text-gray-600 mb-4 flex-grow">{category.description || 'No description provided.'}</p>
                    </div>
                </a>
            {/each}
        </div>
    </div>
</div>

<style>
    /* You can add additional global or scoped styles here if needed */
</style>
