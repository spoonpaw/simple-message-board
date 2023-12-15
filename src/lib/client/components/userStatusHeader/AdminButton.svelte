<!-- src/lib/client/components/AdminButton.svelte -->

<script>
    import { goto } from '$app/navigation';
    import { Icon } from '@steeze-ui/svelte-icon';
    import { Settings } from '@steeze-ui/lucide-icons'; // Import a suitable admin/settings icon

    function navigateToAdminPanel() {
        goto('/admin');
    }
</script>

<button on:click={navigateToAdminPanel} class="focus:outline-none hover:bg-green-100 p-1 rounded" title="Admin Panel">
    <Icon src={Settings} class="w-4 h-4 text-green-500" />
</button>
