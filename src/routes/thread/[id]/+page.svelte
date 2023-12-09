<!--src/routes/thread/[id]/+page.svelte-->

<script lang="ts">
	import type { PageServerData } from './$types';
	import { goto } from '$app/navigation';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { ArrowLeftCircle, Lock, Pencil, Pin, Trash } from '@steeze-ui/lucide-icons';
	import Modal from '$lib/client/components/Modal.svelte';
	import UserStatusHeader from '$lib/client/components/UserStatusHeader.svelte';
	import QuillEditor from '$lib/client/components/QuillEditor.svelte';

	let editPostModal = false; // Modal for modifying an existing post
	let editedPostId: string | null = null; // Track the ID of the post being edited
	let currentPostContent = ''; // Variable to hold the content of the post being edited
	let editPostQuillEditor: QuillEditor;

	// Variables for the new post Quill editor
	let newPostModal = false; // Modal for submitting a new post
	let newPostQuillEditor: QuillEditor;
	let newPostContent = '';

	function handleNewPostTextChange(event: CustomEvent) {
		newPostContent = event.detail.content;
	}

	function handleEditedPostTextChange(event: CustomEvent) {
		currentPostContent = event.detail.content;
	}

	export let data: PageServerData;
	let { username, userid, thread } = data;
	const isLoggedIn = !!userid;

	function navigateToCategory() {
		goto(`/category/${thread.category_id}`);
	}

	function toggleNewPostModal() {
		newPostModal = !newPostModal;
	}

	function toggleEditPostModal() {
		// No need to pass the postId as an argument, using the already set editedPostId
		editPostModal = !editPostModal;
	}

	async function submitNewPost(event: SubmitEvent) {
		event.preventDefault();

		// Use content from Quill editor instead of FormData
		const postData = {
			content: newPostContent,
			threadId: thread.id
		};

		try {
			const response = await fetch(`/post`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(postData)
			});

			if (response.ok) {
				thread.posts = await response.json();
				toggleNewPostModal();
				newPostContent = ''; // Reset the editor content
			} else {
				console.error('Failed to submit new post.');
			}
		} catch (error) {
			console.error('Error submitting new post:', error);
		}
	}

	function editPost(postId: string, content: string) {
		editedPostId = postId;
		currentPostContent = content; // Set the content of the post being edited
		toggleEditPostModal();
	}

	async function submitEditedPost(event: SubmitEvent) {
		event.preventDefault();
		if (!editedPostId) {
			console.error('No post ID provided for editing.');
			return;
		}

		// Use the content from the Quill editor for the edited post
		const editedContent = currentPostContent;

		try {
			const response = await fetch(`/post/${editedPostId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					content: editedContent,
					threadId: thread.id // Include the thread ID in the request
				})
			});

			if (response.ok) {
				thread.posts = await response.json(); // Update posts with new data
				editedPostId = null; // Reset edited post ID
				currentPostContent = ''; // Reset the Quill editor content
				toggleEditPostModal();
			} else {
				const errorResponse = await response.text();
				console.error('Error response body:', errorResponse);
			}
		} catch (error) {
			console.error('Error submitting edited post:', error);
		}
	}

	async function deletePost(postId: string) {
		try {
			const response = await fetch(`/post/${postId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ threadId: thread.id })
			});

			if (response.ok) {
				thread.posts = await response.json(); // Update posts with new data
			} else {
				console.error('Failed to delete post.');
			}
		} catch (error) {
			console.error('Error deleting post:', error);
		}
	}
</script>

<svelte:head>
	<title>Simple Message Board - {thread.title}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto pt-8 px-4 sm:px-0">
		<div class="flex justify-between items-center mb-6">
			<div>
				<button
					on:click={navigateToCategory}
					class="text-blue-500 hover:text-blue-700 font-bold flex items-center"
				>
					<Icon src={ArrowLeftCircle} class="w-5 h-5 flex-shrink-0 mr-1 align-text-bottom" />
					Back to Category: {thread.category_title}
				</button>

				<h1 class="text-3xl font-semibold text-gray-800 mt-2">Thread: {thread.title}</h1>
				<div>
					{#if thread.pinned}
						<Icon src={Pin} class="inline-block w-5 h-5 mr-2" />
					{/if}
					{#if thread.locked}
						<Icon src={Lock} class="inline-block w-5 h-5 mr-2" />
					{/if}
				</div>
			</div>

			<UserStatusHeader {isLoggedIn} {username} userId={userid ?? ''} />
		</div>

		{#if !thread.locked && isLoggedIn}
			<div class="flex justify-end">
				<button
					class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
					on:click={toggleNewPostModal}
					>Add Reply
				</button>
			</div>
		{/if}

		<!-- Thread Content and Posts -->
		<div class="mb-4">
			{#each thread.posts as post (post.id)}
				<div class="bg-white shadow p-4 rounded-lg mt-4 relative flex">
					{#if post.authorId === userid}
						<div class="absolute top-0 right-0 pt-2 pr-2 flex">
							<button
								on:click={() => editPost(post.id, post.content)}
								class="focus:outline-none hover:bg-blue-100 p-1 rounded mr-1"
								title="Edit Post"
							>
								<Icon src={Pencil} class="w-4 h-4 text-blue-500" />
							</button>
							<button
								on:click={() => deletePost(post.id)}
								class="focus:outline-none hover:bg-red-100 p-1 rounded"
								title="Delete Post"
							>
								<Icon src={Trash} class="w-4 h-4 text-red-500" />
							</button>
						</div>
					{/if}

					<!-- Author Info Container -->
					<div class="flex flex-col items-center w-24">
						<!-- Username -->
						<div class="font-semibold text-blue-500 hover:text-blue-700 w-full text-center">
							<a
								href={`/user/${post.authorId}`}
								class="block truncate w-full"
								title={post.authorUsername}
							>
								{post.authorUsername}
							</a>
						</div>
						<!-- Role Name -->
						<div class="text-xs text-gray-500 mt-1">
							{post.authorRoleName}
						</div>
						<!-- Profile Image -->
						<div class="w-20 h-20 rounded-full mt-1">
							<a href={`/user/${post.authorId}`}>
								<img
									src={post.authorProfileImageUrl}
									alt="Profile picture of {post.authorUsername}"
									class="w-full h-full object-cover rounded-full"
								/>
							</a>
						</div>
						<!-- Num. Posts by User -->
						<div class="mt-2 text-sm text-gray-600">
							Posts: {post.authorPostCount}
						</div>
					</div>

					<!-- Content -->
					<div class="ml-5 mr-5">
						<div class="post-content">
							{@html post.content}
							<!-- eslint-disable-line svelte/no-at-html-tags -->
						</div>
					</div>

					<!-- Additional Details -->
					<div class="flex flex-col justify-end ml-auto text-sm text-gray-500">
						<p>
							Posted on: {new Date(post.createdAt).toLocaleString()}
						</p>
						{#if post.updatedAt}
							<p>
								Last updated at: {new Date(post.updatedAt).toLocaleString()}
							</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	{#if !thread.locked && isLoggedIn}
		<!-- New Post Modal -->
		<Modal open={newPostModal} title="Add a Reply" on:close={toggleNewPostModal}>
			<div slot="body">
				<form on:submit={submitNewPost}>
					<QuillEditor
						bind:this={newPostQuillEditor}
						initialContent={newPostContent}
						on:textChange={handleNewPostTextChange}
					/>

					<div class="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button
							type="submit"
							class="w-full inline-flex justify-center rounded-md bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
						>
							Submit
						</button>
						<button
							type="button"
							class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
							on:click={toggleNewPostModal}
							>Cancel
						</button>
					</div>
				</form>
			</div>
		</Modal>

		<!-- Edit Post Modal -->
		<Modal open={editPostModal} title="Edit Post" on:close={toggleEditPostModal}>
			<div slot="body">
				<form on:submit={submitEditedPost}>
					<QuillEditor
						bind:this={editPostQuillEditor}
						initialContent={currentPostContent}
						on:textChange={handleEditedPostTextChange}
					/>

					<div class="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button
							type="submit"
							class="w-full inline-flex justify-center rounded-md bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
						>
							Save Changes
						</button>
						<button
							type="button"
							class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
							on:click={toggleEditPostModal}
							>Cancel
						</button>
					</div>
				</form>
			</div>
		</Modal>
	{/if}
</div>
