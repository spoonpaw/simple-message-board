<!-- src/lib/client/components/UserProfileButton.svelte -->

<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon';
	import { UserCircle } from '@steeze-ui/lucide-icons';
	import { goto } from '$app/navigation';
	export let userId: string; // Define the userId prop

	function redirectToUserProfile() {
		// Redirect to the user profile page
		goto(`/user/${userId}`);
	}
</script>

<button
	on:click={redirectToUserProfile}
	class="focus:outline-none hover:bg-blue-100 p-1 rounded"
	title="Go to User Profile"
>
	<Icon src={UserCircle} class="w-4 h-4 text-blue-500" />
</button>
