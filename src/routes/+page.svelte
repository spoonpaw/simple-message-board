<script lang="ts">
	import type { PageServerData } from './$types';

	export let data: PageServerData = {};

	let loggedIn = !!data.username;

	async function logout() {
		const response = await fetch('/logout', { method: 'GET' });

		if (response.ok) {
			// Instead of using goto, perform a full page reload
			window.location.reload();
		} else {
			console.error('Logout failed');
		}
	}
</script>

{#if loggedIn}
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div class="text-center">
            <h1 class="text-5xl font-bold text-gray-800 mb-8">
                Welcome to the Simple Message Board, {data.username}!
            </h1>
            <nav class="space-x-4">
                <button on:click={logout} class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300">Logout</button>
                <a href="/board" class="inline-block px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-300">Go to Board</a>
            </nav>
        </div>
    </div>
{:else}
<div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
    <div class="text-center">
        <h1 class="text-5xl font-bold text-gray-800 mb-8">
            Welcome to the Simple Message Board!
        </h1>
        <nav class="space-x-4">
            <a href="/register" class="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300">Register</a>
            <a href="/login" class="inline-block px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-300">Login</a>
        </nav>
    </div>
</div>
{/if}

<style>
    /* Your additional global styles would go here */
</style>
