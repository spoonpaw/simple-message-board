<!--src/routes/thread/[id]/+page.svelte-->

<script lang="ts">
	import type {PageServerData, PostView} from './$types';
	import {goto} from '$app/navigation';
	import {Icon} from '@steeze-ui/svelte-icon';
	import {ArrowLeftCircle, Lock, Pencil, Pin, Trash2, Quote} from '@steeze-ui/lucide-icons';
	import Modal from '$lib/client/components/Modal.svelte';
	import UserStatusHeader from '$lib/client/components/UserStatusHeader.svelte';
	import QuillEditor from '$lib/client/components/QuillEditor.svelte';
	import {getTextFromHtml} from '$lib/shared/htmlUtils/getTextFromHtml';
	import { parse, HTMLElement } from 'node-html-parser';

	export let data: PageServerData;
	let {username, userid, thread} = data;
	const isLoggedIn = !!userid;

	let editPostModal = false; // Modal for modifying an existing post
	let editedPostId: string | null = null; // Track the ID of the post being edited
	let currentPostContent = ''; // Variable to hold the content of the post being edited
	let editPostQuillEditor: QuillEditor;
	let isOriginatingPost = false; // To track if the post being edited is the originating post
	let currentThreadTitle = ''; // To hold the current thread title


	// Variables for the new post Quill editor
	let newPostModal = false; // Modal for submitting a new post
	let newPostQuillEditor: QuillEditor;
	let newPostContent = '';

	let quotedPostId: string | null = null; // ID of the post being quoted
	let quotingAuthorUsername: string | null = null; // Username of the author of the quoted post

	function handleNewPostTextChange(event: CustomEvent) {
		newPostContent = event.detail.content;
	}

	function handleEditedPostTextChange(event: CustomEvent) {
		currentPostContent = event.detail.content;
	}
	function navigateToCategory() {
		goto(`/category/${thread.category_id}`);
	}

	function openNewPostModal(quotePostId: string | null = null, authorUsername: string | null = null) {
		quotedPostId = quotePostId;
		quotingAuthorUsername = authorUsername;
		newPostModal = true;
		newPostContent = ''; // Reset the new post content
	}


	function closeNewPostModal() {
		newPostModal = false;
		// Reset the new post content and quoted post information
		newPostContent = '';
		quotedPostId = null;
		quotingAuthorUsername = null;
	}

	function openEditPostModal() {
		editPostModal = true;
	}

	function closeEditPostModal() {
		editPostModal = false;
		// Reset the edited post state when the modal is closed
		editedPostId = null;
		currentPostContent = '';
		isOriginatingPost = false;
		currentThreadTitle = '';
	}

	async function submitNewPost(event: SubmitEvent) {
		event.preventDefault();

		if (getTextFromHtml(newPostContent).length > 8000) {
			newPostQuillEditor.triggerError('Content exceeds 8000 characters.');
			return;
		}

		const postData = {
			content: newPostContent,
			threadId: thread.id,
			quotedPostId: quotedPostId // Include quoted post ID if available
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
				closeNewPostModal();
				newPostContent = ''; // Reset the editor content
			} else {
				const responseData = await response.json();
				console.error('Failed to submit new post:', responseData);

				// Use the server-provided error message if available
				newPostQuillEditor.triggerError(responseData.error || 'Failed to create new thread.');
			}
		} catch (error) {
			console.error('Error submitting new post:', error);
			newPostQuillEditor.triggerError('Error creating new post. Please try again.');
		}
	}

	function editPost(postId: string, content: string, originatingPost: boolean) {
		editedPostId = postId;
		currentPostContent = content;
		isOriginatingPost = originatingPost; // Set the flag based on the post
		if (originatingPost) {
			currentThreadTitle = thread.title; // Set the current thread title if it's the originating post
		}
		openEditPostModal();
	}

	async function submitEditedPost(event: SubmitEvent) {
		event.preventDefault();
		if (!editedPostId) {
			editPostQuillEditor.triggerError('No post ID provided for editing.');
			return;
		}

		// Check if title length exceeds limits only if this is the originating post
		if (isOriginatingPost && currentThreadTitle.length > 60) {
			editPostQuillEditor.triggerError('Title exceeds 60 characters.');
			return;
		}

		if (getTextFromHtml(currentPostContent).length > 8000) {
			editPostQuillEditor.triggerError('Content exceeds 8000 characters.');
			return;
		}

		// Base object
		const editedData = {
			content: currentPostContent,
			threadId: thread.id
		};

		// Conditionally adding title property
		const dataToSend = isOriginatingPost
			? {...editedData, title: currentThreadTitle}
			: editedData;

		try {
			const response = await fetch(`/post/${editedPostId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(dataToSend)
			});

			if (response.ok) {
				const updatedData = await response.json();
				thread.posts = updatedData.posts;

				// Check for the existence of updatedThreadTitle in the response
				if (isOriginatingPost && updatedData.updatedThreadTitle) {
					thread.title = updatedData.updatedThreadTitle;
				}

				closeEditPostModal();
			} else {
				// Handling non-OK response
				const errorResponse = await response.json();
				editPostQuillEditor.triggerError(errorResponse.error || 'Failed to edit post.');
			}
		} catch (error) {
			console.error('Error submitting edited post:', error);
			editPostQuillEditor.triggerError('Error submitting edited post. Please try again.');
		}
	}

	async function deletePost(postId: string) {
		try {
			const response = await fetch(`/post/${postId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({threadId: thread.id})
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

	function renderQuotedPost(quotedPost: PostView): string {
		// Parse the content as HTML
		const root = parse(quotedPost.content);

		// Modify all img tags to have a max height and width
		root.querySelectorAll('img').forEach((img: HTMLElement) => {
			img.setAttribute('style', 'max-height: 100px; max-width: 100px;');
		});

		// Serialize the modified HTML back to a string
		const serializedContent = root.toString();

		return `
        <div class="bg-gray-100 p-2 border-l-4 border-blue-500 mb-2 w-auto">
            <div class="text-sm font-medium">
                <a href="/user/${quotedPost.authorId}" class="text-blue-600 hover:text-blue-800 hover:underline">@${quotedPost.authorUsername}</a>
            </div>
            <div class="text-sm text-gray-600 italic">${serializedContent}</div>
            ${quotedPost.quotedPost ? renderQuotedPost(quotedPost.quotedPost) : ''}
        </div>
    `;
	}


	$: currentThreadTitleLength = currentThreadTitle.length;
	$: currentPostContentLength = getTextFromHtml(currentPostContent).length;
	$: newPostContentLength = getTextFromHtml(newPostContent).length;

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
                    <Icon src={ArrowLeftCircle} class="w-5 h-5 flex-shrink-0 mr-1 align-text-bottom"/>
                    Back to Category: {thread.category_title}
                </button>

                <h1 class="text-3xl font-semibold text-gray-800 mt-2">Thread: {thread.title}</h1>
                <div>
                    {#if thread.pinned}
                        <Icon src={Pin} class="inline-block w-5 h-5 mr-2"/>
                    {/if}
                    {#if thread.locked}
                        <Icon src={Lock} class="inline-block w-5 h-5 mr-2"/>
                    {/if}
                </div>
            </div>

            <UserStatusHeader {isLoggedIn} {username} userId={userid ?? ''}/>
        </div>

        {#if !thread.locked && isLoggedIn}
            <div class="flex justify-end">
                <button
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                        on:click={() => openNewPostModal()}
                >Add Reply
                </button>
            </div>
        {/if}

        <!-- Thread Content and Posts -->
        <div class="mb-4">
            {#each thread.posts as post (post.id)}
                <div class="bg-white shadow p-4 rounded-lg mt-4 relative flex">

                    <div class="absolute top-0 right-0 pt-2 pr-2 flex">
                        {#if !thread.locked && !post.deleted && isLoggedIn}
                            <!-- Quote Button for all non-deleted posts -->
                            <button
                                    on:click={() => openNewPostModal(post.id, post.authorUsername)}
                                    class="focus:outline-none hover:bg-green-100 p-1 rounded mr-1"
                                    title="Quote Post"
                            >
                                <Icon src={Quote} class="w-4 h-4 text-green-500"/>
                            </button>
                        {/if}
                        {#if !thread.locked && post.authorId === userid && !post.deleted}
                            <!-- Edit Button -->
                            <button
                                    on:click={() => editPost(post.id, post.content, post.originatingPost)}
                                    class="focus:outline-none hover:bg-blue-100 p-1 rounded mr-1"
                                    title="Edit Post"
                            >
                                <Icon src={Pencil} class="w-4 h-4 text-blue-500"/>
                            </button>
                            <!-- Delete Button -->
                            <button
                                    on:click={() => deletePost(post.id)}
                                    class="focus:outline-none hover:bg-red-100 p-1 rounded"
                                    title="Delete Post"
                            >
                                <Icon src={Trash2} class="w-4 h-4 text-red-500"/>
                            </button>
                        {/if}
                    </div>

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

                        <!-- Additional Details -->
                        <div class="text-center text-sm text-gray-500">
                            <p>Posted on: {new Date(post.createdAt).toLocaleString()}</p>
                            {#if post.updatedAt}
                                <p class="mt-1">Last updated at: {new Date(post.updatedAt).toLocaleString()}</p>
                            {/if}
                            {#if post.deletedAt}
                                <p class="mt-1">Deleted at: {new Date(post.deletedAt).toLocaleString()}</p>
                            {/if}
                        </div>
                    </div>
                    <!-- Content and Quoted Posts with responsive design -->
                    <div class="overflow-auto ml-5 mr-5 mt-4 w-auto">
                        {#if post.quotedPost}
                            <!-- Display quoted post content in a container that adjusts to content -->
                            <div class="w-auto overflow-x-auto bg-gray-100 p-2 border-l-4 border-blue-500">
                                {@html renderQuotedPost(post.quotedPost)}
                            </div>
                        {/if}
                        <div>{@html post.content}</div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

{#if !thread.locked && isLoggedIn}
    <!-- New Post Modal -->
    <Modal open={newPostModal}
           title={quotingAuthorUsername ? `Quoting ${quotingAuthorUsername}'s Post` : "Add a Reply"}
           on:close={closeNewPostModal}>

        <div slot="body">
            <form on:submit={submitNewPost}>
                <QuillEditor
                        bind:this={newPostQuillEditor}
                        initialContent={newPostContent}
                        on:textChange={handleNewPostTextChange}
                />

                <!-- Character counter for Quill editor content -->
                <p class="text-right text-sm mb-4">
                    {#if newPostContentLength > 8000}
                        <span class="text-red-600">{newPostContentLength}/8000</span>
                    {:else}
                        <span class="text-gray-600">{newPostContentLength}/8000</span>
                    {/if}
                </p>

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
                            on:click={closeNewPostModal}
                    >Cancel
                    </button>
                </div>
            </form>
        </div>
    </Modal>

    <!-- Edit Post Modal -->
    <Modal open={editPostModal} title="Edit Post" on:close={closeEditPostModal}>
        <div slot="body">
            <form on:submit={submitEditedPost}>
                {#if isOriginatingPost}
                    <input
                            type="text"
                            bind:value={currentThreadTitle}
                            class="w-full p-2 border border-gray-300 rounded mb-4"
                            placeholder="Thread Title"
                            required
                            maxlength="60"
                    />
                    <!-- Character counter -->
                    <p class="text-right text-sm mb-4">
                        {#if currentThreadTitleLength > 60}
                            <span class="text-red-600">{currentThreadTitleLength}/60</span>
                        {:else}
                            <span class="text-gray-600">{currentThreadTitleLength}/60</span>
                        {/if}
                    </p>
                {/if}
                <QuillEditor
                        bind:this={editPostQuillEditor}
                        initialContent={currentPostContent}
                        on:textChange={handleEditedPostTextChange}
                />

                <!-- Character counter for Quill editor content -->
                <p class="text-right text-sm mb-4">
                    {#if currentPostContentLength > 8000}
                        <span class="text-red-600">{currentPostContentLength}/8000</span>
                    {:else}
                        <span class="text-gray-600">{currentPostContentLength}/8000</span>
                    {/if}
                </p>

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
                            on:click={closeEditPostModal}
                    >Cancel
                    </button>
                </div>
            </form>
        </div>
    </Modal>
{/if}
