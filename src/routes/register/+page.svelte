<!-- src/routes/register/+page.svelte -->

<script lang="ts">
	import {writable} from 'svelte/store';
	import isEmail from 'validator/lib/isEmail';

	let username = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let successMessage = writable('');
	let errorMessage = writable('');

	function validateEmail() {
		if (!isEmail(email)) {
			errorMessage.set('Invalid email address.');
			return false;
		}
		return true;
	}

    function validateUsername() {
        const allowedCharacters = /^[a-zA-Z0-9._-]+$/; // Regular expression for allowed characters

        if (username.length < 3 || username.length > 20) {
            errorMessage.set('Username must be between 3 and 20 characters.');
            return false;
        }

        if (!allowedCharacters.test(username)) {
            errorMessage.set('Username can only contain letters, numbers, dots (.), underscores (_), and hyphens (-).');
            return false;
        }

        return true;
    }

	function validatePasswordLength() {
		if (password.length < 8 || password.length > 64) {
			errorMessage.set('Password must be between 8 and 64 characters.');
			return false;
		}
		return true;
	}

	function passwordsMatch() {
		return password === confirmPassword;
	}

	async function register() {
		if (!validateEmail() || !validateUsername() || !validatePasswordLength()) return;
		if (!passwordsMatch()) {
			errorMessage.set('Passwords do not match.');
			return;
		}

		successMessage.set('');
		errorMessage.set('');

		try {
			const res = await fetch('/register', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({username, email, password})
			});

			const data = await res.json();

			if (res.ok) {
				successMessage.set(data.message || 'Registration successful!');
			} else {
				errorMessage.set(data.error || 'An error occurred during registration.');
			}
		} catch (error) {
			errorMessage.set('There was a problem submitting the form.');
		}
	}
</script>

<svelte:head>
    <title>Simple Message Board - Register</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
    {#if $successMessage}
        <p class="text-green-500 mb-4">{$successMessage}</p>
    {/if}
    {#if $errorMessage}
        <p class="text-red-500 mb-4">{$errorMessage}</p>
    {/if}
    <div class="max-w-md w-full space-y-8">
        <div class="bg-white p-8 border border-gray-300 rounded-lg shadow-md">
            <form on:submit|preventDefault={register} class="space-y-6">
                <div>
                    <label for="username" class="text-sm font-medium text-gray-700 block mb-2"
                    >Username:</label
                    >
                    <input
                            id="username"
                            type="text"
                            bind:value={username}
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label for="email" class="text-sm font-medium text-gray-700 block mb-2">Email:</label>
                    <input
                            id="email"
                            type="email"
                            bind:value={email}
                            required
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
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label for="confirmPassword" class="text-sm font-medium text-gray-700 block mb-2">Confirm
                        Password:</label>
                    <input
                            id="confirmPassword"
                            type="password"
                            bind:value={confirmPassword}
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                <button
                        type="submit"
                        class="w-full px-3 py-2 bg-indigo-600 text-white rounded-md focus:bg-indigo-700 focus:outline-none"
                >
                    Register
                </button>
            </form>
        </div>
        <div class="text-sm font-medium text-center text-gray-500 space-y-2">
            <div>
                Already have an account?
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
