<!-- src/lib/client/components/UserStatusHeader.svelte -->

<script lang="ts">
	import UserProfileButton from '$lib/client/components/userStatusHeader/UserProfileButton.svelte';
	import LoginButton from '$lib/client/components/userStatusHeader/LoginButton.svelte';
	import AdminButton from "$lib/client/components/userStatusHeader/AdminButton.svelte";
	import LogoutButton from "$lib/client/components/userStatusHeader/LogoutButton.svelte";

	export let username: string;
	export let isLoggedIn: boolean;
	export let userId: string;
	export let canAccessAdminPanel: boolean;
</script>

<div class="block inline text-right">
    <div class="block md:inline-block text-lg text-gray-600 mr-2 md:mr-4 whitespace-normal">Hi {username}!</div>
    {#if isLoggedIn}
        <div class="block md:inline text-right">
            {#if canAccessAdminPanel}
                <AdminButton/>
            {/if}
            <UserProfileButton {userId}/>
            <LogoutButton/>
        </div>
    {:else}
        <LoginButton/>
    {/if}
</div>
