<!-- src/routes/user/[id]/+page.svelte -->

<script lang="ts">
	import type { PageData } from './$types';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { ArrowLeftCircle } from '@steeze-ui/lucide-icons';
	import UserStatusHeader from '$lib/client/components/UserStatusHeader.svelte';

	export let data: PageData;

	function navigateBack() {
		window.history.back();
	}
</script>

<svelte:head>
	<title>User Profile - {data.userProfile.username}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto py-8 px-4 sm:px-0">
		<div class="flex justify-between items-center mb-6">
			<button
				on:click={navigateBack}
				class="text-blue-500 hover:text-blue-700 font-bold flex items-center"
			>
				<Icon src={ArrowLeftCircle} class="w-5 h-5 mr-1 align-text-bottom" />
				Back
			</button>
			<UserStatusHeader
				isLoggedIn={data.isAuthenticated}
				username={data.authenticatedUsername}
				userId={data.authenticatedUserId ?? ''}
			/>
		</div>

		<div class="bg-white shadow-lg rounded-lg p-6 mb-6">
			<h1 class="text-3xl font-semibold text-gray-800 mb-4">User Profile</h1>
			<div class="flex flex-col items-center md:flex-row md:items-start md:space-x-6">
				<img
					src={data.userProfile.profileImageUrl}
					alt="Profile picture of {data.userProfile.username}"
					class="w-32 h-32 rounded-full object-cover mb-4 md:mb-0"
				/>
				<div>
					<p class="text-xl text-gray-800 font-semibold">{data.userProfile.username}</p>
					<p class="text-md text-gray-600">{data.userProfile.email}</p>
					<!-- Additional user details can be added here -->
				</div>
			</div>
		</div>
		<!-- Additional sections or user related information can go here -->
	</div>
</div>

<style>
	/* Custom styles if needed */
</style>
