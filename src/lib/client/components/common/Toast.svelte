<!--src/lib/client/components/common/Toast.svelte-->

<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { toastManager } from "../../../../stores/toastManager";
	import type { Toast as ToastType } from "../../../../stores/toastManager";

	export let toast: ToastType;

	onMount(() => {
		setTimeout(() => {
			toastManager.removeToast(toast.id);
		}, toast.duration || 3000);
	});
</script>

<div in:fade={{ duration: 300 }}
     out:fade={{ duration: 300 }}
     class="mb-4 p-4 min-w-[200px] max-w-[300px] text-sm text-white font-semibold tracking-wide rounded-lg shadow-lg"
     class:bg-green-500={toast.type === 'success'}
     class:bg-red-500={toast.type === 'error'}
     class:bg-blue-500={toast.type === 'info'}>
    {toast.message}
</div>
