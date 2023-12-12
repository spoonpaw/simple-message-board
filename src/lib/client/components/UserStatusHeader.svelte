<!-- src/lib/client/components/UserStatusHeader.svelte -->

<script lang="ts">
	import UserProfileButton from '$lib/client/components/UserProfileButton.svelte';
	import LoginButton from '$lib/client/components/LoginButton.svelte';
	import AdminButton from "$lib/client/components/AdminButton.svelte";
	import LogoutButton from "$lib/client/components/LogoutButton.svelte";

	export let username: string;
	export let isLoggedIn: boolean;
	export let userId: string;
	export let canAccessAdminPanel: boolean;
</script>

<div class="flex space-x-4 ml-2">
    <div class="text-lg text-gray-600">Hi {username}!</div>
    {#if isLoggedIn}
        {#if canAccessAdminPanel}  <!-- Conditionally render AdminButton -->
            <div>
                <!--uncomment this when you have built the admin page-->
                <!--<AdminButton/>-->
            </div>
        {/if}
        <div>
            <UserProfileButton {userId}/>
        </div>
        <div>
            <LogoutButton/>
        </div>
    {:else}
        <div>
            <LoginButton/>
        </div>
    {/if}
</div>
