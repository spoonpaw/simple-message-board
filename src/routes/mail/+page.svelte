<!-- src/routes/mail/+page.svelte -->

<script lang="ts">
	import Navbar from "$lib/client/components/common/Navbar.svelte";
	import {Home, Edit2} from "@steeze-ui/lucide-icons";
	import {goto} from "$app/navigation";
	import type {PageServerData, ReceivedMessageView, SentMessageView} from './$types';
	import {Icon} from "@steeze-ui/svelte-icon";
	import {convertHtmlToPlainText} from "$lib/shared/htmlUtils/convertHtmlToPlainText";
	import Modal from "$lib/client/components/common/Modal.svelte";
	import ToastContainer from "$lib/client/components/common/ToastContainer.svelte";
	import {toastManager} from "../../stores/toastManager";
	import QuillEditor from '$lib/client/components/common/QuillEditor.svelte';
	import {getTextFromHtml} from "$lib/shared/htmlUtils/getTextFromHtml";

	export let data: PageServerData;

	let {username, userId, receivedMessages, sentMessages, permissions} = data;
	let activeTab = 'inbox'; // 'inbox' or 'outbox'
	let showReadMessageModal = false;
	let selectedMessage: ReceivedMessageView | SentMessageView | null = null;

	// compose message variables
	let composeMessageModal = false; // State for compose message modal
	let messageRecipient = '';
	let messageSubject = '';
	let messageContent = '';
	let messageQuillEditor: QuillEditor; // Variable for Quill editor instance

	function openComposeMessageModal() {
		composeMessageModal = true;
	}

	function closeComposeMessageModal() {
		composeMessageModal = false;
		resetComposeMessageForm();
	}

	// Reset the compose message form fields
	function resetComposeMessageForm() {
		messageRecipient = '';
		messageSubject = '';
		messageContent = '';
	}

	async function submitMessage(event: SubmitEvent) {
		event.preventDefault();

		// Validate the inputs before making the fetch request
		if (!messageRecipient.trim()) {
			messageQuillEditor.triggerError('Recipient is required.');
			return;
		}

		if (!messageSubject.trim() || messageSubject.length > 60) {
			messageQuillEditor.triggerError('Subject is required and must not exceed 60 characters.');
			return;
		}

		const contentLength = getTextFromHtml(messageContent).length;
		if (!messageContent.trim() || contentLength > 8000) {
			messageQuillEditor.triggerError('Content is required and must not exceed 8000 characters.');
			return;
		}

		try {
			const response = await fetch('/message', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					recipientUsername: messageRecipient,
					subject: messageSubject,
					content: messageContent
				})
			});

			if (response.ok) {
				const newMessage = await response.json();
				// Add new message to the top of the sent messages
				sentMessages = [newMessage, ...sentMessages];
				closeComposeMessageModal();

				// Display success toast
				toastManager.addToast({
					message: 'Message sent successfully',
					type: 'success',
					duration: 3000
				});
			} else {
				const errorResponse = await response.json();
				// Display error message using QuillEditor's error mechanism
				messageQuillEditor.triggerError(errorResponse.message || 'Failed to send message');
			}
		} catch (error) {
			console.error('Error sending message:', error);
			messageQuillEditor.triggerError('An error occurred while sending the message.');
		}
	}

	async function deleteMessage() {
		// Check if selectedMessage is not null
		if (selectedMessage) {
			try {
				const response = await fetch(`/message/${selectedMessage.id}`, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (response.ok) {
					// Extract the message ID for convenience
					const messageId = selectedMessage.id;

					// Remove the message from the appropriate array
					if (receivedMessages.some(m => m.id === messageId)) {
						receivedMessages = receivedMessages.filter(m => m.id !== messageId);
					} else if (sentMessages.some(m => m.id === messageId)) {
						sentMessages = sentMessages.filter(m => m.id !== messageId);
					}

					// Display success toast
					toastManager.addToast({
						message: 'Message successfully deleted',
						type: 'success',
						duration: 3000
					});
				} else {
					// Display error toast for unsuccessful deletion
					toastManager.addToast({
						message: 'Error deleting message',
						type: 'error',
						duration: 3000
					});
				}
			} catch (error) {
				// Handle fetch errors
				console.error('Error deleting message:', error);
				toastManager.addToast({
					message: 'Error deleting message',
					type: 'error',
					duration: 3000
				});
			} finally {
				// Close the modal irrespective of success or failure
				closeReadMessageModal();
			}
		}
	}

	function replyToMessage() {
		if (selectedMessage) {
			// Store necessary details from the selected message
			const replyRecipient = 'sender_username' in selectedMessage ? selectedMessage.sender_username :
				'recipient_username' in selectedMessage ? selectedMessage.recipient_username : '';
			const replySubject = 'Re: ' + selectedMessage.subject;

			// Close the read message modal and clear selected message
			closeReadMessageModal();

			// Set the recipient for the new message
			messageRecipient = replyRecipient;

			// Prefix subject with 'Re: ', truncate if necessary
			messageSubject = replySubject.length > 60 ? replySubject.substring(0, 57) + '...' : replySubject;

			// Clear the message content and open the compose message modal
			messageContent = '';
			openComposeMessageModal();
		}
	}

	function openReadMessageModal(message: ReceivedMessageView | SentMessageView) {
		selectedMessage = message;
		showReadMessageModal = true;
	}

	function closeReadMessageModal() {
		showReadMessageModal = false;
		selectedMessage = null;
	}

	async function openMessage(messageId: string) {
		// Search in both receivedMessages and sentMessages
		const message = receivedMessages.find(m => m.id === messageId) || sentMessages.find(m => m.id === messageId);

		if (message) {
			openReadMessageModal(message);

			// Check if the message is a received message and hasn't been marked as read
			if (!message.read_at && receivedMessages.some(m => m.id === messageId)) {
				const response = await fetch(`/message/${messageId}/read`, {method: 'POST'});
				if (response.ok) {
					const {read_at} = await response.json();
					message.read_at = read_at; // Update the read_at in the local state

					// Update only the receivedMessages array
					receivedMessages = receivedMessages.map(m => m.id === messageId ? {...m, read_at} : m);
				}
			}
		}
	}

	function navigateToHome() {
		goto('/');
	}

	$: canAccessAdminPanel = permissions.some((permission) => permission.name === 'access_admin_panel');

	// Character counters
	$: messageSubjectLength = messageSubject.length;
	$: messageContentLength = getTextFromHtml(messageContent).length;

</script>

<svelte:head>
    <title>Mail</title>
</svelte:head>

<ToastContainer/>

<div class="min-h-screen bg-gray-50">
    <div class="container mx-auto py-8 px-4 sm:px-0">
        <!-- Navbar Component -->
        <Navbar
                iconSrc={Home}
                text="Home"
                onIconClick={navigateToHome}
                isLoggedIn={true}
                username={username}
                userId={userId}
                canAccessAdminPanel={canAccessAdminPanel}
        />

        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
            <div class="flex justify-between items-center px-6 py-4">
                <h1 class="text-3xl font-semibold text-gray-800">
                    Mail
                </h1>
                <button
                        class="px-3 py-1 bg-blue-500 text-white rounded-lg flex items-center hover:bg-blue-600 transition-colors duration-300"
                        on:click={openComposeMessageModal}
                >
                    <Icon src={Edit2} class="w-4 h-4 mr-2"/>
                    Compose
                </button>
            </div>
            <div class="flex justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-1 rounded-t-3xl">
                <button
                        class={`mx-1 px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === 'inbox' ? 'bg-white text-gray-800 shadow-md' : 'bg-transparent text-white hover:bg-white hover:text-gray-800'}`}
                        on:click={() => activeTab = 'inbox'}>
                    Inbox
                </button>
                <button
                        class={`mx-1 px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === 'outbox' ? 'bg-white text-gray-800 shadow-md' : 'bg-transparent text-white hover:bg-white hover:text-gray-800'}`}
                        on:click={() => activeTab = 'outbox'}>
                    Outbox
                </button>
            </div>

            <div class="p-6">
                {#if activeTab === 'inbox'}
                    {#if receivedMessages.length === 0}
                        <p class="text-center text-gray-600">No received messages yet.</p>
                    {:else}
                        <!-- Display received messages -->
                        <ul class="space-y-2">
                            {#each receivedMessages as message (message.id)}
                                <li>
                                    <button
                                            class="w-full text-left transition-colors duration-300 rounded-lg shadow cursor-pointer p-4 {message.read_at ? 'bg-gray-100 hover:bg-gray-200' : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'}"
                                            on:click={() => openMessage(message.id)}
                                    >
                                        <span class="block {message.read_at ? 'text-lg font-semibold truncate' : 'text-lg font-bold truncate text-blue-600'}">{message.subject}</span>
                                        <span class="block text-gray-600 truncate">{convertHtmlToPlainText(message.content)}</span>
                                        <span class="block text-left text-sm text-gray-500">
                                            From: {message.sender_username}
                                            - {new Date(message.sent_at).toLocaleString()}
                                        </span>
                                        <!-- Icon for unread message -->
                                        {#if !message.read_at}
                                            <span class="text-blue-500">🌟 New</span>
                                        {/if}
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    {/if}

                {:else}
                    {#if sentMessages.length === 0}
                        <p class="text-center text-gray-600">No sent messages yet.</p>
                    {:else}
                        <!-- Display sent messages -->
                        <ul class="space-y-2">
                            {#each sentMessages as message (message.id)}
                                <li>
                                    <button
                                            class="w-full text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-300 rounded-lg shadow cursor-pointer p-4"
                                            on:click={() => openMessage(message.id)}
                                    >
                                        <span class="block text-lg font-semibold truncate">{message.subject}</span>
                                        <span class="block text-gray-600 truncate">{convertHtmlToPlainText(message.content)}</span>
                                        <span class="block text-left text-sm text-gray-500">
                                            To: {message.recipient_username}
                                            - {new Date(message.sent_at).toLocaleString()}
                                        </span>
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
</div>

<Modal open={showReadMessageModal} title="Message Details" on:close={closeReadMessageModal}>
    <div slot="body">
        {#if selectedMessage}
            <div class="mb-1 px-4 py-1 border-b border-gray-200">
                <h3 class="text-lg font-semibold">{selectedMessage.subject}</h3>
            </div>

            <div class="mb-1 px-4 py-1 border-b border-gray-200">
                <div class="formatted-content content-area overflow-y-auto max-h-96 sm:max-h-[60vh] md:max-h-[75vh] lg:max-h-[60vh]">
                    {@html selectedMessage.content} <!-- Display the message content -->
                </div>
            </div>

            <div class="text-sm text-gray-500 px-4 py-1">
                {#if activeTab === 'inbox' && 'sender_username' in selectedMessage}
                    <p>From: {selectedMessage.sender_username}</p>
                {:else if activeTab === 'outbox' && 'recipient_username' in selectedMessage}
                    <p>To: {selectedMessage.recipient_username}</p>
                {/if}
                <p>Sent: {new Date(selectedMessage.sent_at).toLocaleString()}</p>
            </div>
            <!-- Footer Section with Buttons -->
            <div class="flex justify-around px-4 py-2">
                <button
                        class="px-4 py-2 text-white bg-gray-500 hover:bg-gray-600 rounded transition duration-200 ease-in-out"
                        on:click={closeReadMessageModal}>
                    Close
                </button>

                <button
                        class="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded transition duration-200 ease-in-out"
                        on:click={deleteMessage}>
                    Delete
                </button>

                <button
                        class="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded transition duration-200 ease-in-out"
                        on:click={replyToMessage}>
                    Reply
                </button>
            </div>
        {/if}
    </div>
</Modal>

<Modal open={composeMessageModal} title="Compose Message" on:close={closeComposeMessageModal}>
    <div slot="body">
        <form on:submit={submitMessage}>
            <input
                    type="text"
                    bind:value={messageRecipient}
                    class="w-full p-2 border rounded mb-2"
                    placeholder="Recipient Username"
                    required
            />
            <input
                    type="text"
                    bind:value={messageSubject}
                    class="w-full p-2 border rounded mb-2"
                    placeholder="Message Subject"
                    required
                    maxlength="60"
            />
            <!-- Character counter for message subject -->
            <p class="text-right text-sm mb-4">
                {#if messageSubjectLength > 60}
                    <span class="text-red-600">{messageSubjectLength}/60</span>
                {:else}
                    <span class="text-gray-600">{messageSubjectLength}/60</span>
                {/if}
            </p>
            <QuillEditor
                    bind:this={messageQuillEditor}
                    initialContent={messageContent}
                    on:textChange={(e) => messageContent = e.detail.content}
            />
            <!-- Character counter for Quill editor content -->
            <p class="text-right text-sm mb-4">
                {#if messageContentLength > 8000}
                    <span class="text-red-600">{messageContentLength}/8000</span>
                {:else}
                    <span class="text-gray-600">{messageContentLength}/8000</span>
                {/if}
            </p>
            <div class="flex justify-end mt-4 space-x-2">
                <button
                        type="button"
                        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                        on:click={closeComposeMessageModal}
                >
                    Cancel
                </button>
                <button
                        type="submit"
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Send Message
                </button>
            </div>
        </form>
    </div>
</Modal>
