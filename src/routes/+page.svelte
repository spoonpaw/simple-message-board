<!--src/routes/+page.svelte-->

<script lang="ts">
	import type { PageServerData } from './$types';

	export let data: PageServerData = {};

	let loggedIn = !!data.username;

	let canAccessAdminPanel = false;

	if (data.permissions) {
		canAccessAdminPanel = data.permissions.some((permission) => permission.name === 'access_admin_panel');
	}

	async function logout() {
		const response = await fetch('/logout', { method: 'GET' });

		if (response.ok) {
			window.location.reload();
		} else {
			console.error('Logout failed');
		}
	}
</script>

<svelte:head>
	<title>Simple Message Board</title>
</svelte:head>

{#if loggedIn}
	<div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
		<div class="text-center">
			<h1 class="text-5xl font-bold text-gray-800 mb-8">
				Welcome to the Simple Message Board, {data.username}!
			</h1>
			<nav class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center">
                {#if canAccessAdminPanel}
					<!--uncomment this when the admin page is done-->
                    <!--<a
                        href="/admin"
                        class="inline-block px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition duration-300"
                    >
                        Admin Panel
                    </a>-->
                {/if}
				<button
					on:click={logout}
					class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
				>
					Logout
				</button>
				<a
					href={`/user/${data.userid}`}
					class="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-300"
				>
					View Profile
				</a>
				<a
					href="/board"
					class="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300"
				>
					Go to Board
				</a>
			</nav>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
		<div class="text-center">
			<h1 class="text-5xl font-bold text-gray-800 mb-8">Welcome to the Simple Message Board!</h1>
			<nav class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center">
				<a
					href="/register"
					class="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
				>
					Register
				</a>
				<a
					href="/login"
					class="inline-block px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
				>
					Login
				</a>
				<a
					href="/board"
					class="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300"
				>
					View Board Anonymously
				</a>
			</nav>
		</div>
	</div>
{/if}
