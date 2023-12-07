<!-- src/routes/user/[id]/+page.svelte -->

<script lang="ts">
	import type { PageData } from './$types';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { ArrowLeftCircle, Pencil } from '@steeze-ui/lucide-icons';
	import UserStatusHeader from '$lib/client/components/UserStatusHeader.svelte';
	import Modal from '$lib/client/components/Modal.svelte';

	export let data: PageData;

	let showAvatarModal: boolean = false;
	let invalidAvatarFileMessage: string = ''; // Reactive variable to track invalid file selection
	let avatarPreviewImageUrl: string | null = null;
	let avatarFileInput: HTMLInputElement;
	let showBioModal = false;
	let editedBio = data.userProfile.bio;
	let bioWarningMessage = '';

	function handleBioModalClose() {
		showBioModal = false;
		editedBio = data.userProfile.bio; // Reset edited bio to original
	}

	async function handleBioUpdate(event: Event) {
		event.preventDefault();
		try {
			const response = await fetch('/user/bio', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ bio: editedBio })
			});

			const responseData = await response.json();

			if (response.ok) {
				data.userProfile.bio = responseData.bio;
				showBioModal = false;
			} else {
				bioWarningMessage = responseData.error || 'Error updating bio';
			}
		} catch (error) {
			console.error('Error updating bio:', error);
			bioWarningMessage = 'Error updating bio';
		}
	}

	function navigateBack(): void {
		window.history.back();
	}

	function changeAvatarClicked(): void {
		showAvatarModal = true;
	}

	function handleAvatarModalClose(): void {
		showAvatarModal = false;
		invalidAvatarFileMessage = '';
		avatarPreviewImageUrl = null;
		if (avatarFileInput) {
			avatarFileInput.value = ''; // Reset the file input
		}
	}

	function validateAvatarFile(event: Event): void {
		invalidAvatarFileMessage = '';
		avatarPreviewImageUrl = null; // Reset the preview image URL
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;

		const file = input.files[0];

		// Validate file type
		if (!['image/jpeg', 'image/png'].includes(file.type)) {
			invalidAvatarFileMessage = 'Invalid file type. Please select a JPG or PNG image.';
			input.value = ''; // Reset the input if the file is invalid
			return;
		}

		// Validate file size
		const maxFileSize = 100 * 1024; // 100KB in bytes
		if (file.size > maxFileSize) {
			invalidAvatarFileMessage = 'File is too large. Maximum size is 100KB.';
			input.value = ''; // Reset the input
			return;
		}

		// Validate dimensions
		const maxDimension = 256;
		const img = new Image();
		img.onload = () => {
			if (img.width > maxDimension || img.height > maxDimension) {
				invalidAvatarFileMessage =
					'Image dimensions are too large. Maximum dimensions are 256x256 pixels.';
				input.value = ''; // Reset the input
			} else {
				// Set preview image URL only if it passes all checks
				avatarPreviewImageUrl = URL.createObjectURL(file);
			}
		};
		img.src = URL.createObjectURL(file);
	}

	async function handleAvatarImageUpload(event: Event): Promise<void> {
		event.preventDefault();
		if (invalidAvatarFileMessage) return;

		if (!avatarFileInput || !avatarFileInput.files || avatarFileInput.files.length === 0) {
			invalidAvatarFileMessage = 'No file selected.';
			return;
		}

		const file = avatarFileInput.files[0];
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
				showAvatarModal = false;
			} else {
				// Display the error message from the server
				invalidAvatarFileMessage = responseData.error || 'Error uploading file';
			}
		} catch (error) {
			console.error('Upload error:', error);
			invalidAvatarFileMessage = 'Error uploading file';
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
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
				<!-- Profile image section -->
				<div
					class={data.userProfile.isOwnProfile
						? 'relative w-32 h-32 mb-4 md:mb-0 hover:cursor-pointer group'
						: 'relative w-32 h-32 mb-4 md:mb-0'}
				>
					<img
						src={data.userProfile.profileImageUrl}
						alt="Profile picture of {data.userProfile.username}"
						class={data.userProfile.isOwnProfile
							? 'rounded-full object-cover w-full h-full transition-all duration-300 ease-in-out group-hover:blur-sm'
							: 'rounded-full object-cover w-full h-full'}
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

				<!-- User information and bio section -->
				<div class="md:flex-1">
					<!-- User information -->
					<p class="text-3xl text-gray-800 font-semibold">{data.userProfile.username}</p>

					{#if data.userProfile.isOwnProfile}
						<p class="text-md text-gray-600">{data.userProfile.email}</p>
					{/if}

					<!-- Account details section -->
					<div class="mt-4">
						<h2 class="text-xl font-semibold text-gray-800">Account Details</h2>
						<p class="text-md text-gray-600">
							Member since: {formatDate(data.userProfile.createdAt)}
						</p>
						{#if data.userProfile.lastLogin}
							<p class="text-md text-gray-600">
								Last login: {formatDate(data.userProfile.lastLogin)}
							</p>
						{/if}
					</div>

					<!-- User bio -->
					<div class="mt-4">
						<div class="flex items-center">
							<h2 class="text-2xl font-semibold text-gray-800">Bio</h2>
							{#if data.userProfile.isOwnProfile}
								<button
									class="text-blue-500 hover:text-blue-700 font-bold flex items-center ml-2"
									on:click={() => (showBioModal = true)}
									title="Edit Bio"
								>
									<Icon src={Pencil} class="w-5 h-5" />
								</button>
							{/if}
						</div>
						<p class="text-md text-gray-600 mt-2">
							{data.userProfile.bio || 'No bio available'}
						</p>
					</div>
				</div>
			</div>
		</div>
		<!-- Additional sections or user related information can go here -->
	</div>
</div>

{#if data.userProfile.isOwnProfile}
	<!-- Avatar Upload Modal -->
	<Modal open={showAvatarModal} title="Change Avatar" on:close={handleAvatarModalClose}>
		<div slot="body">
			<form on:submit|preventDefault={handleAvatarImageUpload} class="space-y-4">
				<input
					type="file"
					accept="image/*"
					on:change={validateAvatarFile}
					bind:this={avatarFileInput}
					class="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
				/>

				{#if avatarPreviewImageUrl}
					<img
						src={avatarPreviewImageUrl}
						alt="Preview"
						class="w-32 h-32 rounded-full object-cover"
					/>
				{/if}
				{#if invalidAvatarFileMessage}
					<p class="text-red-500 text-sm">{invalidAvatarFileMessage}</p>
				{/if}

				<!-- Button Container -->
				<div class="flex justify-end space-x-4 pt-4">
					<!-- Cancel Button -->
					<button
						type="button"
						class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-300"
						on:click={handleAvatarModalClose}
					>
						Cancel
					</button>
					<!-- Upload Image Button -->
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

	<!-- Bio Edit Modal -->
	<Modal open={showBioModal} title="Edit Bio" on:close={handleBioModalClose}>
		<div slot="body">
			<form on:submit|preventDefault={handleBioUpdate} class="space-y-4">
				<textarea bind:value={editedBio} class="w-full p-2 border rounded" required></textarea>
				{#if bioWarningMessage}
					<p class="text-red-500 text-sm">{bioWarningMessage}</p>
				{/if}
				<div class="flex justify-end space-x-4 pt-4">
					<!-- Cancel Button -->
					<button
						type="button"
						class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-300"
						on:click={handleBioModalClose}
					>
						Cancel
					</button>
					<!-- Save Changes Button -->
					<button
						type="submit"
						class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
					>
						Save Changes
					</button>
				</div>
			</form>
		</div>
	</Modal>
{/if}
