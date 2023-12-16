<!-- src/lib/client/components/LoginButton.svelte -->

<script>
	import { goto } from '$app/navigation';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { LogIn } from '@steeze-ui/lucide-icons'; // Import a suitable login icon

	function login() {
		goto('/login');
	}
</script>

<button on:click={login} class="focus:outline-none hover:bg-blue-100 p-1 rounded" title="Login">
	<Icon src={LogIn} class="w-5 h-5 text-blue-500" />
</button>
