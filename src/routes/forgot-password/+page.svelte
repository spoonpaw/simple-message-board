<!--src/routes/forgot-password/+page.svelte-->

<script>
    import { writable } from 'svelte/store';

    let userIdentifier = ''; // Can be either username or email
    let errorMessage = writable('');
    let successMessage = writable('');

    async function requestPasswordReset() {
        errorMessage.set('');
        successMessage.set('');

        try {
            const res = await fetch('/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIdentifier })
            });

            const data = await res.json();

            if (res.ok) {
                successMessage.set('A password reset link has been sent to your email.');
            } else {
                errorMessage.set(data.error || 'An error occurred while requesting a password reset.');
            }
        } catch (error) {
            errorMessage.set('There was a problem submitting the form.');
        }
    }
</script>

<svelte:head>
    <title>Simple Message Board - Forgot Password</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <div class="bg-white p-8 border border-gray-300 rounded-lg shadow-md">
            <form on:submit|preventDefault={requestPasswordReset} class="space-y-6">
                <div>
                    <label for="userIdentifier" class="text-sm font-medium text-gray-700 block mb-2">
                        Username or Email:
                    </label>
                    <input
                            id="userIdentifier"
                            type="text"
                            bind:value={userIdentifier}
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                <button
                        type="submit"
                        class="w-full px-3 py-2 bg-indigo-600 text-white rounded-md focus:bg-indigo-700 focus:outline-none">
                    Request Password Reset
                </button>
            </form>
        </div>
        {#if $errorMessage}
            <p class="text-red-500 text-center">{ $errorMessage }</p>
        {/if}
        {#if $successMessage}
            <p class="text-green-500 text-center">{ $successMessage }</p>
        {/if}
        <div class="text-sm font-medium text-center text-gray-500 space-y-2">
            <div>
                <a href="/login" class="text-indigo-600 hover:text-indigo-500">Login</a>
            </div>
            <div>
                <a href="/" class="flex items-center justify-center text-indigo-600 hover:text-indigo-500">
                    <span class="mr-1 mb-1">←</span>Back to Home
                </a>
            </div>

        </div>
    </div>
</div>
