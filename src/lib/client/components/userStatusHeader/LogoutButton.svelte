<!--src/lib/client/components/LogoutButton.svelte-->

<script>
	import { Icon } from '@steeze-ui/svelte-icon';
	import { LogOut } from '@steeze-ui/lucide-icons';

	async function logout() {
		const response = await fetch('/logout', { method: 'GET' });
		if (response.ok) {
			window.location.reload(); // Reload the current page
		} else {
			console.error('Logout failed');
		}
	}
</script>

<button on:click={logout} class="focus:outline-none hover:bg-red-100 p-1 rounded" title="Logout">
    <Icon src={LogOut} class="w-5 h-5 text-red-500" />
</button>
