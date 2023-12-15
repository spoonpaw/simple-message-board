<!--src/routes/category/[id]/+page.svelte-->

<script lang="ts">
	import type {PageServerData} from './$types';
	import {goto} from '$app/navigation';
	import {Icon} from '@steeze-ui/svelte-icon';
	import {Pin, Lock, ArrowLeftCircle, Trash2, PinOff, Unlock} from '@steeze-ui/lucide-icons';
	import Modal from '$lib/client/components/common/Modal.svelte';
	import type {ThreadCategoryView} from '$lib/shared';
	import QuillEditor from '$lib/client/components/common/QuillEditor.svelte';
	import {getTextFromHtml} from '$lib/shared/htmlUtils/getTextFromHtml';
	import Navbar from "$lib/client/components/common/Navbar.svelte";

	export let data: PageServerData;
	const {username, userid, category, permissions} = data;
	let threads: ThreadCategoryView[] = data.threads;
	const isLoggedIn = !!userid;
	let newThreadModal = false; // Modal for creating a new thread
	let newThreadTitle = '';
	let newThreadContent = '';
	let newThreadQuillEditor: QuillEditor; // Variable for Quill editor instance

	let canLockThread = false;
	let canPinThread = false;
	let canDeleteThread = false;
	let canAccessAdminPanel = false;

	// Check for permissions
	if (permissions) {
		canLockThread = permissions.some(permission => permission.name === 'lock_thread');
		canPinThread = permissions.some(permission => permission.name === 'pin_thread');
		canDeleteThread = permissions.some(permission => permission.name === 'delete_thread');
		canAccessAdminPanel = permissions.some(permission => permission.name === 'access_admin_panel');
	}

	async function togglePinThread(threadId: string, pin: boolean) {
		try {
			const response = await fetch(`/thread/${threadId}/pin`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({pin})
			});

			if (response.ok) {
				// Update the threads array with the new list from the server
				threads = await response.json();
				console.log(`Thread ${pin ? 'pinned' : 'unpinned'} successfully`);
			} else {
				console.error('Failed to change thread pin state');
			}
		} catch (error) {
			console.error('Error toggling thread pin state:', error);
		}
	}

	async function toggleLockThread(threadId: string, lock: boolean) {
		try {
			const response = await fetch(`/thread/${threadId}/lock`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({lock})
			});

			if (response.ok) {
				// Update the threads array with the new list from the server
				threads = await response.json();
				console.log(`Thread ${lock ? 'locked' : 'unlocked'} successfully`);
			} else {
				console.error('Failed to change thread lock state');
			}
		} catch (error) {
			console.error('Error toggling thread lock state:', error);
		}
	}

	async function deleteThread(threadId: string) {
		try {
			const response = await fetch(`/thread/${threadId}`, {
				method: 'DELETE'
			});
			if (response.ok) {
				// Get the updated list of threads from the response
				threads = await response.json();
				console.log('Thread deleted successfully');
			} else {
				console.error('Failed to delete the thread');
			}
		} catch (error) {
			console.error('Error deleting thread:', error);
		}
	}

	function handleNewThreadTextChange(event: CustomEvent) {
		newThreadContent = event.detail.content;
	}

	function openNewThreadModal() {
		newThreadModal = true;
	}

	function closeNewThreadModal() {
		newThreadModal = false;
		newThreadTitle = '';
		newThreadContent = '';
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
	$: titleLength = newThreadTitle.length;
	$: contentLength = getTextFromHtml(newThreadContent).length;

	async function submitNewThread(event: SubmitEvent) {
		event.preventDefault();

		// Check if title or content length exceeds limits
		if (newThreadTitle.length > 60) {
			newThreadQuillEditor.triggerError('Title exceeds 60 characters.');
			return;
		}
		if (getTextFromHtml(newThreadContent).length > 8000) {
			newThreadQuillEditor.triggerError('Content exceeds 8000 characters.');
			return;
		}

		const postData = {
			title: newThreadTitle,
			content: newThreadContent,
			categoryId: category.id
		};

		try {
			const response = await fetch('/thread', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(postData)
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
				// Handle error response from the server
				newThreadQuillEditor.triggerError(responseData.error || 'Failed to create new thread.');
			}
		} catch (error) {
			console.error('Error creating new thread:', error);
			newThreadQuillEditor.triggerError('Error creating new thread. Please try again.');
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
        <!-- Navbar Component -->
        <Navbar
            iconSrc={ArrowLeftCircle}
            text="Back to Main Board"
            onIconClick={navigateToBoard}
            {isLoggedIn}
            {username}
            userId={userid ?? ''}
            {canAccessAdminPanel}
        />

                <h1 class="text-3xl font-semibold text-gray-800 mt-2">Category: {category.title}</h1>
        <p class="text-gray-600 mb-4">{category.description}</p>
        {#if isLoggedIn}
            <div class="flex justify-end px-4">
                <button
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                        on:click={openNewThreadModal}
                >New Thread
                </button>
            </div>
        {/if}
        <div class="flex flex-wrap justify-center gap-6 items-stretch">
            {#each sortedThreads as thread (thread.id)}
                <div class="block w-full md:w-1/2 lg:w-1/3 p-4 relative">
                    <div class="absolute top-5 right-5 flex space-x-1">
                        {#if canLockThread}
                            <button
                                    class="focus:outline-none hover:bg-gray-100 p-1 rounded"
                                    title="{thread.locked ? 'Unlock Thread' : 'Lock Thread'}"
                                    on:click={(event) => {
                                        event.stopPropagation();
                                        toggleLockThread(thread.id, !thread.locked);
                                    }}
                            >
                                <Icon src={thread.locked ? Unlock : Lock} class="w-4 h-4 text-gray-500"/>
                            </button>
                        {/if}

                        {#if canPinThread}
                            <button
                                    class="focus:outline-none hover:bg-blue-100 p-1 rounded"
                                    title="{thread.pinned ? 'Unpin Thread' : 'Pin Thread'}"
                                    on:click={(event) => {
                                        event.stopPropagation();
                                        togglePinThread(thread.id, !thread.pinned);
                                    }}
                            >
                                <Icon src={thread.pinned ? PinOff : Pin} class="w-4 h-4 text-blue-500"/>
                            </button>

                        {/if}

                        {#if canDeleteThread}
                            <button
                                    class="focus:outline-none hover:bg-red-100 p-1 rounded"
                                    title="Delete Thread"
                                    on:click={(event) => { event.stopPropagation(); deleteThread(thread.id); }}
                            >
                                <Icon src={Trash2} class="w-4 h-4 text-red-500"/>
                            </button>
                        {/if}

                    </div>

                    <a href={`/thread/${thread.id}`} class="no-underline">
                        <div class="bg-white shadow-lg rounded-lg p-6 transition duration-150 ease-in-out hover:shadow-xl">
                            <h2 class="text-xl font-semibold text-blue-600 mb-1">{thread.title}</h2>
                            <div class="text-gray-600 mb-2">
                                {#if thread.pinned}
                                    <Icon src={Pin} class="inline-block w-5 h-5 mr-1"/>
                                {/if}
                                {#if thread.locked}
                                    <Icon src={Lock} class="inline-block w-5 h-5 mr-1"/>
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
                </div>
            {/each}
        </div>
    </div>
</div>

{#if isLoggedIn}
    <Modal open={newThreadModal} title="Create New Thread" on:close={closeNewThreadModal}>
        <div slot="body">
            <form on:submit={submitNewThread}>
                <input
                        type="text"
                        bind:value={newThreadTitle}
                        class="w-full p-2 border rounded mb-2"
                        placeholder="Thread Title"
                        required
                        maxlength="60"
                />
                <!-- Character counter -->
                <p class="text-right text-sm mb-4">
                    {#if titleLength > 60}
                        <span class="text-red-600">{titleLength}/60</span>
                    {:else}
                        <span class="text-gray-600">{titleLength}/60</span>
                    {/if}
                </p>

                <QuillEditor
                        bind:this={newThreadQuillEditor}
                        initialContent={newThreadContent}
                        on:textChange={handleNewThreadTextChange}
                />

                <!-- Character counter for Quill editor content -->
                <p class="text-right text-sm mb-4">
                    {#if contentLength > 8000}
                        <span class="text-red-600">{contentLength}/8000</span>
                    {:else}
                        <span class="text-gray-600">{contentLength}/8000</span>
                    {/if}
                </p>

                <div class="flex justify-end mt-4 space-x-2">
                    <button
                            type="button"
                            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            on:click={closeNewThreadModal}
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
