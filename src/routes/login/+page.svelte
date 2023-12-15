<!-- src/routes/login/+page.svelte -->

<script>
    import {writable} from 'svelte/store';
    import {goto} from '$app/navigation'; // Import the goto function for navigation

    let username = '';
    let password = '';
    let errorMessage = writable('');

    async function login() {
        errorMessage.set('');

        try {
            const res = await fetch('/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });

            const data = await res.json();

            if (res.ok) {
                // Use SvelteKit's goto function for client-side navigation
                await goto('/'); // Assuming '/' is the route for the home page
            } else {
                errorMessage.set(data.error || 'Invalid username or password.');
            }
        } catch (error) {
            errorMessage.set('There was a problem submitting the form.');
        }
    }

    // Function to handle "Forgot Password" click
    function forgotPassword() {
        goto('/forgot-password'); // Navigate to the forgot password page
    }
</script>

<svelte:head>
    <title>Simple Message Board - Login</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
    {#if $errorMessage}
        <p class="text-red-500 mb-4">{$errorMessage}</p>
    {/if}
    <div class="max-w-md w-full space-y-8">
        <div class="bg-white p-8 border border-gray-300 rounded-lg shadow-md">
            <form on:submit|preventDefault={login} class="space-y-6">
                <div>
                    <label for="username" class="text-sm font-medium text-gray-700 block mb-2"
                    >Username:</label
                    >
                    <input
                            id="username"
                            type="text"
                            bind:value={username}
                            required
                            autocomplete="username"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label for="password" class="text-sm font-medium text-gray-700 block mb-2"
                    >Password:</label
                    >
                    <input
                            id="password"
                            type="password"
                            bind:value={password}
                            required
                            autocomplete="current-password"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                <button
                        type="submit"
                        class="w-full px-3 py-2 bg-indigo-600 text-white rounded-md focus:bg-indigo-700 focus:outline-none"
                >
                    Login
                </button>
            </form>
        </div>
        <div class="text-sm font-medium text-center text-gray-500 space-y-2">
            <div>
                Don't have an account?
                <a href="/register" class="text-indigo-600 hover:text-indigo-500">Register</a>
            </div>
            <div>
                <button
                        class="text-indigo-600 hover:text-indigo-500"
                        on:click={forgotPassword}>
                    Forgot Password?
                </button>
            </div>
            <div>
                <a href="/" class="flex items-center justify-center text-indigo-600 hover:text-indigo-500">
                    <span class="mr-1 mb-1">←</span>
                    Back to Home
                </a>
            </div>

        </div>

    </div>
</div>
