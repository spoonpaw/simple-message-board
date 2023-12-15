<script lang="ts">
	import type { PageServerData } from "./$types";
	import { goto } from "$app/navigation";

	export let data: PageServerData;

	function redirectToHome() {
		goto('/');
	}
</script>

<main class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
    {#if data.success}
        <div class="max-w-md w-full space-y-8">
            <div class="bg-white p-8 border border-gray-300 rounded-lg shadow-md text-center">
                <h2 class="mb-4 text-xl font-semibold text-gray-900">Email Change Confirmed</h2>
                <p>Your email has been successfully changed.</p>
                <button
                        class="mt-4 w-full px-3 py-2 bg-indigo-600 text-white rounded-md focus:bg-indigo-700 focus:outline-none"
                        on:click={redirectToHome}>
                    Go to Home
                </button>
            </div>
        </div>
    {:else}
        <div class="max-w-md w-full space-y-8">
            <div class="bg-white p-8 border border-gray-300 rounded-lg shadow-md text-center">
                <h2 class="mb-4 text-xl font-semibold text-gray-900">Email Change Failed</h2>
                <p>{data.error || 'An unknown error occurred.'}</p>
            </div>
        </div>
    {/if}
</main>
