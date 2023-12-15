<!-- src/routes/user/[id]/+page.svelte -->

<script lang="ts">
	import type {PageData} from './$types';
	import {Icon} from '@steeze-ui/svelte-icon';
	import {Home, Pencil} from '@steeze-ui/lucide-icons';
	import Modal from '$lib/client/components/common/Modal.svelte';
	import {toastManager} from "../../../stores/toastManager";
	import ToastContainer from "$lib/client/components/common/ToastContainer.svelte";
	import Navbar from "$lib/client/components/common/Navbar.svelte";
	import {goto} from "$app/navigation";

	export let data: PageData;

	let showAvatarModal: boolean = false;
	let invalidAvatarFileMessage: string = ''; // Reactive variable to track invalid file selection
	let avatarPreviewImageUrl: string | null = null;
	let avatarFileInput: HTMLInputElement;
	let showBioModal = false;
	let editedBio = data.userProfile.bio;
	let bioWarningMessage = '';
	let showEmailChangeModal = false;
	let newEmail = '';
	let emailChangeWarningMessage = '';

	let showAssignRoleModal = false;
	let selectedRoleId: string | undefined; // This will be bound to the dropdown

	// Reactive statements to handle changes in data
	$: banned = data.userProfile.banned;
	$: canAccessAdminPanel = data.permissions.some((permission) => permission.name === 'access_admin_panel');
	$: canBanUsersOfLowerRole = data.permissions.some((permission) => permission.name === 'ban_user_lower_role');
	$: canViewEmails = data.permissions.some((permission) => permission.name === 'view_user_emails');
	$: canAssignRoles = data.permissions.some((permission) => permission.name === 'assign_roles');

	function openAssignRoleModal() {
		console.log(`Assign roles button clicked for user ID ${data.userProfile.id}`);
		selectedRoleId = data.userProfile.role?.id; // Preselect the current user's role
		showAssignRoleModal = true;
	}

	function closeAssignRoleModal() {
		console.log('Assign roles modal closed');
		showAssignRoleModal = false;
	}

	async function handleSubmitAssignRole(event: Event) {
		event.preventDefault();

		const selectedRole = data.roles.find(role => role.id === selectedRoleId);
		console.log(`Role ID ${selectedRoleId} (named ${selectedRole?.name}) assigned to user ID ${data.userProfile.id}`);

		try {
			const response = await fetch(`/user/${data.userProfile.id}/assign-role`, {
				method: 'PUT',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({roleId: selectedRoleId})
			});

			const result = await response.json();

			if (response.ok) {
				console.log('Server response:', result);
				if (result.role) {
					data.userProfile.role = result.role; // Update the role in the userProfile
					console.log('Role updated to:', data.userProfile.role);
				}
			} else {
				console.error('Error assigning role:', result.message || 'Unknown error');
				// Optionally, show an error message to the user
			}
		} catch (error) {
			console.error('Error sending request to server:', error);
			// Optionally, show an error message to the user
		}

		closeAssignRoleModal();
	}

	function openEmailChangeModal() {
		showEmailChangeModal = true;
		emailChangeWarningMessage = ''; // Reset the warning message when the modal opens
	}

	function closeEmailChangeModal() {
		showEmailChangeModal = false;
		emailChangeWarningMessage = ''; // Reset the warning message when the modal closes
	}

	async function handleSubmitNewEmail(event: Event) {
		event.preventDefault();
		try {
			const response = await fetch('/change-email', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({newEmail, userId: data.userProfile.id})
			});

			const responseData = await response.json();

			if (response.ok) {
				console.log('Server response:', responseData);
				closeEmailChangeModal(); // Close modal after successful submission
				toastManager.addToast({
					message: responseData.message || 'Email change requested successfully. Please check your new email for a confirmation link.',
					type: 'success',
					duration: 3000
				});
			} else {
				emailChangeWarningMessage = responseData.error || 'Error changing email. Please try again.';
				toastManager.addToast({
					message: emailChangeWarningMessage,
					type: 'error',
					duration: 3000
				});
			}
		} catch (error) {
			console.error('Error changing email:', error);
			emailChangeWarningMessage = 'Error changing email. Please try again.';
			toastManager.addToast({
				message: emailChangeWarningMessage,
				type: 'error',
				duration: 3000
			});
		}
	}

	async function updateBanStatus(ban: boolean): Promise<void> {
		console.log(`Updating ban status to ${ban} for user ID: ${data.userProfile.id}`);
		try {
			const response = await fetch(`/user/${data.userProfile.id}/ban`, {
				method: 'PUT',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({ban})
			});

			console.log('Response received:', response);

			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`);
			}

			const result = await response.json();
			console.log('Response JSON:', result);

			if (result.userProfile) {
				data.userProfile = {...data.userProfile, ...result.userProfile};
				banned = result.userProfile.banned; // Update the banned reactive variable
				console.log('Updated user profile:', data.userProfile);
			}
		} catch (error) {
			console.error('Error updating ban status:', error);
		}
	}

	function banUser(): void {
		updateBanStatus(true);
	}

	function unbanUser(): void {
		updateBanStatus(false);
	}

	function handleBioModalClose() {
		showBioModal = false;
		editedBio = data.userProfile.bio; // Reset edited bio to original
	}

	async function handleBioUpdate(event: Event) {
		event.preventDefault();
		try {
			const response = await fetch('/user/bio', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({bio: editedBio})
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
		const maxFileSize = 500 * 1024; // 500KB in bytes
		if (file.size > maxFileSize) {
			invalidAvatarFileMessage = 'File is too large. Maximum size is 500KB.';
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

	function navigateToHome() {
		goto('/');
	}
</script>

<svelte:head>
    <title>User Profile - {data.userProfile.username}</title>
</svelte:head>

<ToastContainer/>

<div class="min-h-screen bg-gray-50">
    <div class="container mx-auto py-8 px-4 sm:px-0">
        <!-- Navbar Component -->
        <Navbar
                iconSrc={Home}
                text="Home"
                onIconClick={navigateToHome}
                isLoggedIn={data.isAuthenticated}
                username={data.authenticatedUsername}
                userId={data.authenticatedUserId ?? ''}
                canAccessAdminPanel={canAccessAdminPanel}
        />

        <div class="bg-white shadow-lg rounded-lg p-6 mb-6">
            <h1 class="text-3xl font-semibold text-gray-800 mb-4">User Profile</h1>
            {#if banned}
                <p class="text-red-600 font-semibold mb-4">This user is currently banned.</p>
            {/if}
            {#if canBanUsersOfLowerRole && (data.authenticatedUserHierarchyLevel !== null && (data.userProfile.hierarchyLevel === null || data.authenticatedUserHierarchyLevel < data.userProfile.hierarchyLevel))}
                {#if banned}
                    <button
                            on:click={unbanUser}
                            class="mb-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300"
                    >
                        Unban User
                    </button>
                {:else}
                    <button
                            on:click={banUser}
                            class="mb-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300"
                    >
                        Ban User
                    </button>
                {/if}

            {/if}
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

                    <div class="flex items-center">
                        <p class="text-lg font-semibold text-black-600 mr-2">
                            Role: {data?.userProfile?.role?.name || 'No role assigned'}
                        </p>
                        {#if canAssignRoles}
                            <button
                                    class="text-blue-500 hover:text-blue-700"
                                    on:click={openAssignRoleModal}
                                    title="Edit Role"
                            >
                                <Icon src={Pencil} class="w-5 h-5"/>
                            </button>
                        {/if}
                    </div>

                    <!-- Email address section with conditional pencil icon for editing -->
                    <div class="flex items-center">
                        {#if data.userProfile.isOwnProfile || canViewEmails}
                            <p class="text-md text-gray-600 mr-2">{data.userProfile.email}</p>
                            {#if data.userProfile.isOwnProfile}
                                <button
                                        class="text-blue-500 hover:text-blue-700 font-bold flex items-center"
                                        on:click={openEmailChangeModal}
                                        title="Edit Email"
                                >
                                    <Icon src={Pencil} class="w-5 h-5"/>
                                </button>
                            {/if}
                        {/if}
                    </div>

                    <!-- Account details section -->
                    <div class="mt-4">
                        <h2 class="text-xl font-semibold text-gray-800">Account Details</h2>
                        <p class="text-md text-gray-600">
                            Post count: {data.userProfile.postCount}
                        </p>
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
                                    <Icon src={Pencil} class="w-5 h-5"/>
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

    <!-- Email Change Modal -->
    <Modal open={showEmailChangeModal} title="Change Email" on:close={closeEmailChangeModal}>
        <div slot="body">
            <form on:submit|preventDefault={handleSubmitNewEmail} class="space-y-4">
                <input
                        type="email"
                        bind:value={newEmail}
                        class="w-full p-2 border rounded"
                        placeholder="Enter new email address"
                        required
                />
                {#if emailChangeWarningMessage}
                    <p class="text-red-500 text-sm">{emailChangeWarningMessage}</p>
                {/if}
                <!-- Button Container -->
                <div class="flex justify-between pt-4">
                    <!-- Cancel Button -->
                    <button
                            type="button"
                            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-300"
                            on:click={closeEmailChangeModal}
                    >
                        Cancel
                    </button>
                    <!-- Submit Button -->
                    <button
                            type="submit"
                            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
                    >
                        Change Email
                    </button>
                </div>
            </form>
        </div>
    </Modal>

{/if}

{#if canAssignRoles}
    <!-- Assign Role Modal -->
    <Modal open={showAssignRoleModal} title="Assign Role" on:close={closeAssignRoleModal}>
        <div slot="body">
            <form on:submit|preventDefault={handleSubmitAssignRole} class="space-y-4">
                <select
                        bind:value={selectedRoleId}
                        class="w-full p-2 border rounded"
                        required
                >
                    {#each data.roles as role}
                        <option value={role.id} selected={role.id === data?.userProfile?.role?.id}>
                            {role.name}
                        </option>
                    {/each}
                </select>

                <!-- Button Container -->
                <div class="flex justify-between pt-4">
                    <!-- Cancel Button -->
                    <button
                            type="button"
                            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition duration-300"
                            on:click={closeAssignRoleModal}
                    >
                        Cancel
                    </button>
                    <!-- Submit Button -->
                    <button
                            type="submit"
                            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
                    >
                        Assign Role
                    </button>
                </div>
            </form>
        </div>
    </Modal>
{/if}
