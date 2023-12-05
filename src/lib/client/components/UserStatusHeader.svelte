<!-- src/lib/client/components/UserStatusHeader.svelte -->

<script lang="ts">
	// Define the prop types
	import UserProfileButton from '$lib/client/components/UserProfileButton.svelte';
	import { LogoutButton } from '$lib/client';
	import LoginButton from '$lib/client/components/LoginButton.svelte';

	export let username: string;
	export let isLoggedIn: boolean;
	export let userId: string;
</script>

<div class="flex space-x-4">
	<div class="text-lg text-gray-600">Hi {username}!</div>
	{#if isLoggedIn}
		<UserProfileButton {userId} />
		<LogoutButton />
	{:else}
		<LoginButton />
	{/if}
</div>
