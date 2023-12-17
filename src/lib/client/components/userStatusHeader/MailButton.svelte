<!--src/lib/client/components/userStatusHeader/MailButton.svelte-->

<script lang="ts">
	import {onDestroy} from 'svelte';
	import {Icon} from '@steeze-ui/svelte-icon';
	import {Mail} from '@steeze-ui/lucide-icons';
	import {goto} from '$app/navigation';
	import {socketStore} from '$lib/client/stores/socketStore';
    import { unreadMessagesStore } from '$lib/client/stores/unreadMessagesStore';
	import type {Socket} from "socket.io-client";

	export let userId: string;
	let socket: Socket | null;

	// Reactive declaration to handle socket initialization
	$: if ($socketStore) {
		socket = $socketStore;
		setupSocketListeners();
	}

	function setupSocketListeners() {
		socket?.emit('register-mail-button', {userId});

		socket?.on('mail-button-message-received', () => {
			console.log('mail-button-message-received, setting hasUnreadMessages to true');
            unreadMessagesStore.set(true); // Update store value
		});
	}

	onDestroy(() => {
		if (socket) {
			socket.emit('deregister-mail-button');
			socket.off('mail-button-message-received');
		}
	});

	function navigateToMailPage() {
		goto('/mail');
	}
</script>

<button
        on:click={navigateToMailPage}
        class={`focus:outline-none p-1 rounded
        ${$unreadMessagesStore ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-gradient-spin shadow-lg animate-shadow-pulse hover:from-pink-400 hover:via-purple-400 hover:to-blue-400'
                            : 'hover:bg-purple-100'}`}
        title="Go to Mail"
>
    <Icon src={Mail} class={`w-5 h-5 ${$unreadMessagesStore ? 'text-white' : 'text-purple-500'}`}/>
</button>

<style>
    @keyframes gradient-spin {
        0%, 100% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
    }

    .animate-gradient-spin {
        animation: gradient-spin 3s linear infinite;
        background-size: 200% 200%;
    }

    @keyframes shadow-pulse {
        0%, 100% {
            box-shadow: 0 0 3px 2px rgba(255, 105, 180, .4), 0 0 5px 3px rgba(128, 0, 128, .4), 0 0 7px 4px rgba(0, 0, 255, .4);
        }
        50% {
            box-shadow: 0 0 5px 2px rgba(255, 105, 180, .6), 0 0 7px 4px rgba(128, 0, 128, .6), 0 0 9px 5px rgba(0, 0, 255, .6);
        }
    }

    .animate-shadow-pulse {
        animation: shadow-pulse 3s ease-in-out infinite;
    }
</style>
