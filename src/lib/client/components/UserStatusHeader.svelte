<!-- src/lib/client/components/UserStatusHeader.svelte -->

<script lang="ts">
	import UserProfileButton from '$lib/client/components/UserProfileButton.svelte';
	import { LogoutButton } from '$lib/client';
	import LoginButton from '$lib/client/components/LoginButton.svelte';

	export let username: string;
	export let isLoggedIn: boolean;
	export let userId: string;
</script>

<div class="flex space-x-4 ml-2">
	<div class="text-lg text-gray-600">Hi {username}!</div>
	{#if isLoggedIn}
		<div>
		<UserProfileButton {userId} />
		</div>
		<div>
		<LogoutButton />
		</div>
	{:else}
		<div>
		<LoginButton />
		</div>
	{/if}
</div>
