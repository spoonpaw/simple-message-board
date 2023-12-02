<!--src/routes/board/+page.svelte-->

<script lang="ts">
	import type { PageServerData } from './$types';
	import { LogoutButton } from '$lib/client';
	import type { Category } from '$lib/shared'; // Import the LogoutButton component

	export let data: PageServerData;
	let username = data.username;
	let categories: Category[] = data.categories;
</script>

<svelte:head>
	<title>Simple Message Board - Main Board</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto py-8 px-4 sm:px-0">
		<div class="flex justify-between items-center mb-6">
			<h1 class="text-3xl font-semibold text-gray-800">Message Board</h1>

			<div class="flex space-x-4">
				<div class="text-lg text-gray-600">Hi {username}!</div>
				<LogoutButton />
				<!-- Use the LogoutButton component -->
			</div>


		</div>
		<div class="flex flex-wrap justify-center gap-6 items-stretch">
			{#each categories as category (category.id)}
				<a href={`/category/${category.id}`} class="block w-full md:w-1/2 lg:w-1/3 p-4">
					<div
						class="bg-white shadow-lg rounded-lg p-6 transition duration-150 ease-in-out hover:shadow-xl cursor-pointer h-full flex flex-col"
					>
						<h2 class="text-xl font-semibold text-blue-600 mb-2">{category.title}</h2>
						<p class="text-gray-600 mb-4 flex-grow">
							{category.description || 'No description provided.'}
						</p>
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>
