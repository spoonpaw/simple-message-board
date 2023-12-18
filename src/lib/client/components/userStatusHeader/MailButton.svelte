<!--src/lib/client/components/userStatusHeader/MailButton.svelte-->

<script lang="ts">
	import {Icon} from '@steeze-ui/svelte-icon';
	import {Mail} from '@steeze-ui/lucide-icons';
	import {goto} from '$app/navigation';
	import {unreadMessagesStore} from '$lib/client/stores/unreadMessagesStore';
	import {onMount, onDestroy} from 'svelte';

	export let userId: string;
	let eventSource: EventSource | null = null;
	let reconnectInterval: number | null = null;

	function initializeEventSource() {
		eventSource = new EventSource(`/events/mail-button`);

		eventSource.onmessage = (event) => {
			console.log(`[MailButton] Received event:`, event);

			// Handle heartbeat messages for debugging or monitoring
			if (event.data === ':heartbeat') {
				console.log('[MailButton] Heartbeat received.');
				return;
			}

			const eventData = JSON.parse(event.data); // Parse the JSON string

			if (eventData === 'newMessageReceived') {
				console.log('[MailButton] New message received.');
				unreadMessagesStore.set(true); // Updating unreadMessagesStore
			}
		};

		eventSource.onerror = (error) => {
			console.error(`[MailButton] SSE connection error:`, error);
			eventSource?.close();
			// Clear any existing reconnection attempt
			if (reconnectInterval !== null) {
				clearTimeout(reconnectInterval);
			}
			// Cast setTimeout return value to number
			reconnectInterval = setTimeout(initializeEventSource, 5000) as unknown as number;
		};
	}

	onMount(() => {
		console.log(`[MailButton] Mounting component and initializing SSE connection.`);
		initializeEventSource();
	});

	onDestroy(() => {
		console.log(`[MailButton] Unmounting component and closing SSE connection.`);
		if (reconnectInterval !== null) {
			clearTimeout(reconnectInterval);
		}
		eventSource?.close();
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
