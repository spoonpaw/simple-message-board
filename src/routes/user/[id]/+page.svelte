<!-- src/routes/user/[id]/+page.svelte -->

<script lang="ts">
	import type { PageData } from './$types';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { ArrowLeftCircle } from '@steeze-ui/lucide-icons';
	import UserStatusHeader from '$lib/client/components/UserStatusHeader.svelte';
	import Modal from '$lib/client/components/Modal.svelte';

	export let data: PageData;

	let showModal: boolean = false;

	function navigateBack(): void {
		window.history.back();
	}

	function changeAvatarClicked(): void {
		showModal = true;
	}

	let fileInput: HTMLInputElement;

	function handleModalClose(): void {
		showModal = false;
		invalidFileMessage = '';
		previewImageUrl = null;
		if (fileInput) {
			fileInput.value = ''; // Reset the file input
		}
	}

	let invalidFileMessage: string = ''; // Reactive variable to track invalid file selection

	let previewImageUrl: string | null = null;

	function validateFile(event: Event): void {
		invalidFileMessage = '';
		previewImageUrl = null; // Reset the preview image URL
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;

		const file = input.files[0];

		// Validate file type
		if (!['image/jpeg', 'image/png'].includes(file.type)) {
			invalidFileMessage = 'Invalid file type. Please select a JPG or PNG image.';
			input.value = ''; // Reset the input if the file is invalid
			return;
		}

		// Validate file size
		const maxFileSize = 100 * 1024; // 100KB in bytes
		if (file.size > maxFileSize) {
			invalidFileMessage = 'File is too large. Maximum size is 100KB.';
			input.value = ''; // Reset the input
			return;
		}

		// Validate dimensions
		const maxDimension = 256;
		const img = new Image();
		img.onload = () => {
			if (img.width > maxDimension || img.height > maxDimension) {
				invalidFileMessage =
					'Image dimensions are too large. Maximum dimensions are 256x256 pixels.';
				input.value = ''; // Reset the input
			} else {
				// Set preview image URL only if it passes all checks
				previewImageUrl = URL.createObjectURL(file);
			}
		};
		img.src = URL.createObjectURL(file);
	}

	async function handleImageUpload(event: Event): Promise<void> {
		event.preventDefault();
		if (invalidFileMessage) return;

		if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
			invalidFileMessage = 'No file selected.';
			return;
		}

		const file = fileInput.files[0];
		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch('/user/avatar', {
				method: 'POST',
				body: formData
			});

			const responseData = await response.json();

			if (response.ok) {
				// Update the avatar URL and close the modal
				data.userProfile.profileImageUrl = responseData.fileUrl;
				showModal = false;
			} else {
				// Display the error message from the server
				invalidFileMessage = responseData.error || 'Error uploading file';
			}
		} catch (error) {
			console.error('Upload error:', error);
			invalidFileMessage = 'Error uploading file';
		}
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
				<div class="relative w-32 h-32 mb-4 md:mb-0 hover:cursor-pointer group">
					<img
						src={data.userProfile.profileImageUrl}
						alt="Profile picture of {data.userProfile.username}"
						class="rounded-full object-cover w-full h-full transition-all duration-300 ease-in-out group-hover:blur-sm"
					/>
					{#if data.userProfile.isOwnProfile}
						<button
							class="absolute inset-0 bg-black bg-opacity-0 flex justify-center items-center rounded-full group-hover:bg-opacity-50 transition-all duration-300 ease-in-out"
							on:click={changeAvatarClicked}
						>
							<span
								class="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 shadow"
								>Change Avatar</span
							>
						</button>
					{/if}
				</div>

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

{#if data.userProfile.isOwnProfile}
	<Modal open={showModal} title="Change Avatar" on:close={handleModalClose}>
		<div slot="body">
			<form on:submit|preventDefault={handleImageUpload} class="space-y-4">
				<input
					type="file"
					accept="image/*"
					on:change={validateFile}
					bind:this={fileInput}
					class="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100"
				/>

				{#if previewImageUrl}
					<img src={previewImageUrl} alt="Preview" class="w-32 h-32 rounded-full object-cover" />
				{/if}
				{#if invalidFileMessage}
					<p class="text-red-500 text-sm">{invalidFileMessage}</p>
				{/if}

				<!-- Wrapping the button in a div with padding-top for better spacing -->
				<div class="pt-4">
					<button
						type="submit"
						class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
					>
						Upload Image
					</button>
				</div>
			</form>
		</div>
	</Modal>
{/if}
