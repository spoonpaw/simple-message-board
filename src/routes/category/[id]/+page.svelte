<!--src/routes/category/[id]/+page.svelte-->

<script lang="ts">
	import type { PageServerData } from './$types';
	import { goto } from '$app/navigation';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Pin, Lock, ArrowLeftCircle } from '@steeze-ui/lucide-icons';
	import UserStatusHeader from '$lib/client/components/UserStatusHeader.svelte';
	import Modal from '$lib/client/components/Modal.svelte';
	import type { ThreadCategoryView } from '$lib/shared';
	import QuillEditor from '$lib/client/components/QuillEditor.svelte';

	export let data: PageServerData;
	const { username, userid, category } = data;
	let threads: ThreadCategoryView[] = data.threads;
	const isLoggedIn = !!userid;
	let newThreadModal = false; // Modal for creating a new thread
	let newThreadTitle = '';
	let newThreadContent = '';
	let newThreadQuillEditor: QuillEditor; // Variable for Quill editor instance

	function handleNewThreadTextChange(event: CustomEvent) {
		newThreadContent = event.detail.content;
	}

	function toggleNewThreadModal() {
		newThreadModal = !newThreadModal;

		if (!newThreadModal) {
			// Clear out the variables when closing the modal
			newThreadTitle = '';
			newThreadContent = '';
		}
	}

	function sortThreads(threads: ThreadCategoryView[]) {
		// Separate pinned and unpinned threads
		const pinnedThreads = threads.filter((thread) => thread.pinned);
		const unpinnedThreads = threads.filter((thread) => !thread.pinned);

		// Sort each array by date
		const sortFunc = (a: ThreadCategoryView, b: ThreadCategoryView) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

		pinnedThreads.sort(sortFunc);
		unpinnedThreads.sort(sortFunc);

		// Concatenate the arrays: pinned first, then unpinned
		return [...pinnedThreads, ...unpinnedThreads];
	}

	// Sort threads on component mount
	$: sortedThreads = sortThreads(threads);

	async function submitNewThread(event: SubmitEvent) {
		event.preventDefault();

		const postData = {
			title: newThreadTitle,
			content: newThreadContent,
			categoryId: category.id
		};

		try {
			const response = await fetch('/thread', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json' // Specify the content type as JSON
				},
				body: JSON.stringify(postData) // Send the postData object as a JSON string
			});

			const responseData = await response.json();

			if (response.ok) {
				// Update the threads data with the response from the server
				threads = sortThreads(responseData);
				// Reset form fields and close the modal
				newThreadTitle = '';
				newThreadContent = '';
				newThreadModal = false;
			} else {
				// Handle error response
				console.error('Failed to create new thread:', responseData.error);
			}
		} catch (error) {
			console.error('Error creating new thread:', error);
		}
	}

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
					<Icon src={ArrowLeftCircle} class="w-5 h-5 mr-1 align-text-bottom flex-shrink-0" />
					Back to Main Board
				</button>

				<h1 class="text-3xl font-semibold text-gray-800 mt-2">Category: {category.title}</h1>
			</div>

			<UserStatusHeader {isLoggedIn} {username} userId={userid ?? ''} />
		</div>
		<p class="text-gray-600 mb-4">{category.description}</p>
		{#if isLoggedIn}
			<div class="flex justify-end px-4">
				<button
					class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
					on:click={toggleNewThreadModal}
					>New Thread
				</button>
			</div>
		{/if}
		<div class="flex flex-wrap justify-center gap-6 items-stretch">
			{#each sortedThreads as thread (thread.id)}
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

{#if isLoggedIn}
	<Modal open={newThreadModal} title="Create New Thread" on:close={toggleNewThreadModal}>
		<div slot="body">
			<form on:submit={submitNewThread}>
				<input
					type="text"
					bind:value={newThreadTitle}
					class="w-full p-2 border rounded mb-2"
					placeholder="Thread Title"
					required
				/>
				<QuillEditor
					bind:this={newThreadQuillEditor}
					initialContent={newThreadContent}
					on:textChange={handleNewThreadTextChange}
				/>
				<div class="flex justify-end mt-4 space-x-2">
					<button
						type="button"
						class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
						on:click={toggleNewThreadModal}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					>
						Create Thread
					</button>
				</div>
			</form>
		</div>
	</Modal>
{/if}
