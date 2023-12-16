<!-- src/lib/client/components/MailButton.svelte -->

<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Mail } from '@steeze-ui/lucide-icons'; // Import a suitable mail icon
	import { goto } from '$app/navigation';

	function navigateToMailPage() {
		goto('/mail'); // Replace with the actual mail/messages page route
	}
</script>

<button
        on:click={navigateToMailPage}
        class="focus:outline-none hover:bg-purple-100 p-1 rounded"
        title="Go to Mail"
>
    <Icon src={Mail} class="w-5 h-5 text-purple-500" /> <!-- Unique color for mail icon -->
</button>
