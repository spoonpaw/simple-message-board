<!--src/routes/reset-password/[token]/+page.svelte-->
<script lang="ts">
	import type { PageServerData } from "./$types";
	import { goto } from "$app/navigation";

	export let data: PageServerData;

	let newPassword = '';
	let confirmPassword = '';
	let errorMessage = '';
	let successMessage = '';
	let processing = false;

	async function resetPassword() {
		if (newPassword !== confirmPassword) {
			errorMessage = 'Passwords do not match.';
			return;
		}

		errorMessage = '';
		successMessage = '';
		processing = true;

		try {
			const response = await fetch(`/reset-password/${data.token}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ newPassword })
			});

			const result = await response.json();

			if (response.ok) {
				successMessage = 'Password successfully reset.';
				setTimeout(() => goto('/login'), 3000); // Redirect to login after 3 seconds
			} else {
				errorMessage = result.error || 'An error occurred while resetting your password.';
			}
		} catch (error) {
			errorMessage = 'An error occurred while resetting your password.';
		} finally {
			processing = false;
		}
	}

	function redirectToHome() {
		goto('/');
	}
</script>

<main class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
    {#if data.success}
        <div class="max-w-md w-full space-y-8">
            <div class="bg-white p-8 border border-gray-300 rounded-lg shadow-md">
                <h2 class="mb-4 text-xl font-semibold text-gray-900 text-center">Reset Password</h2>
                <form on:submit|preventDefault={resetPassword} class="space-y-6">
                    <div>
                        <label for="newPassword" class="text-sm font-medium text-gray-700 block mb-2">New Password:</label>
                        <input
                                id="newPassword"
                                type="password"
                                bind:value={newPassword}
                                required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label for="confirmPassword" class="text-sm font-medium text-gray-700 block mb-2">Confirm Password:</label>
                        <input
                                id="confirmPassword"
                                type="password"
                                bind:value={confirmPassword}
                                required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    {#if errorMessage}
                        <p class="text-red-500 text-center">{errorMessage}</p>
                    {/if}
                    {#if successMessage}
                        <p class="text-green-500 text-center">{successMessage}</p>
                    {/if}
                    <button
                            type="submit"
                            disabled={processing}
                            class="w-full px-3 py-2 bg-indigo-600 text-white rounded-md focus:bg-indigo-700 focus:outline-none">
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    {:else}
        <div class="max-w-md w-full space-y-8">
            <div class="bg-white p-8 border border-gray-300 rounded-lg shadow-md text-center">
                <h2 class="mb-4 text-xl font-semibold text-gray-900">Reset Failed</h2>
                <p>{data.error || 'An unknown error occurred.'}</p>
                <button
                        class="mt-4 w-full px-3 py-2 bg-indigo-600 text-white rounded-md focus:bg-indigo-700 focus:outline-none"
                        on:click={redirectToHome}>
                    Go to Home
                </button>
            </div>
        </div>
    {/if}
</main>
