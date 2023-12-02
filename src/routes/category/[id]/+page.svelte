<!--src/routes/category/[id]/+page.svelte-->

<script lang="ts">
	import type { PageServerData } from './$types';
	import { goto } from '$app/navigation';
	import { LogoutButton } from '$lib/client'; // Import the LogoutButton component
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Pin, Lock, ArrowLeftCircle } from '@steeze-ui/lucide-icons';

	export let data: PageServerData;
	const { username, category, threads } = data;

	function navigateToBoard() {
		goto('/board');
	}
</script>

<svelte:head>
	<title>Simple Message Board - {category.title}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto py-8 px-4 sm:px-0">
		<div class="flex justify-between items-center mb-6">
			<div>
				<button
					on:click={navigateToBoard}
					class="text-blue-500 hover:text-blue-700 font-bold flex items-center"
				>
					<Icon src={ArrowLeftCircle} class="w-5 h-5 mr-1 align-text-bottom" />
					Back to Main Board
				</button>

				<h1 class="text-3xl font-semibold text-gray-800 mt-2">Category: {category.title}</h1>
			</div>
			<div class="flex space-x-4">
				<div class="text-lg text-gray-600">Hi {username}!</div>
				<LogoutButton />
				<!-- Use the LogoutButton component -->
			</div>

		</div>
		<p class="text-gray-600 mb-4">{category.description}</p>

		<div class="flex flex-wrap justify-center gap-6 items-stretch">
			{#each threads as thread (thread.id)}
				<a href={`/thread/${thread.id}`} class="block w-full md:w-1/2 lg:w-1/3 p-4">
					<div
						class="bg-white shadow-lg rounded-lg p-6 transition duration-150 ease-in-out hover:shadow-xl"
					>
						<h2 class="text-xl font-semibold text-blue-600 mb-1">{thread.title}</h2>
						<div class="text-gray-600 mb-2">
							{#if thread.pinned}
								<Icon src={Pin} class="inline-block w-5 h-5 mr-1" />
							{/if}
							{#if thread.locked}
								<Icon src={Lock} class="inline-block w-5 h-5 mr-1" />
							{/if}
						</div>
						<div class="text-sm text-gray-500">
							<p>
								Started by {thread.creatorUsername} on: {new Date(
									thread.createdAt
								).toLocaleString()}
							</p>
							<p>{thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}</p>
							{#if thread.lastReplyAt}
								<p>
									Last reply by {thread.lastReplierUsername} on: {new Date(
										thread.lastReplyAt
									).toLocaleString()}
								</p>
							{/if}
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>
