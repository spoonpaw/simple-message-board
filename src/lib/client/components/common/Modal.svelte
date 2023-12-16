<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	export let open = false;
	export let title = '';

	const dispatch = createEventDispatcher();

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			dispatch('close');
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeydown);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

{#if open}
	<div
		class="modal z-10 fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0"
		role="dialog"
		aria-label={title}
	>
		<button
			class="modal-overlay fixed w-full h-full bg-gray-900 opacity-50 cursor-default"
			aria-label="Close Modal"
			on:click={() => dispatch('close')}
			style="border: none; padding: 0;"
		></button>

		<div
			class="bg-white w-full lg:h-max lg:w-1/2 mx-auto rounded-lg shadow-xl z-10 overflow-y-auto"
		>
			<div class="flex justify-between items-center head pt-2 px-4 text-2xl font-extrabold">
				{title}
			</div>
			<div class="content px-2 py-2">
				<slot name="body" />
			</div>
		</div>
	</div>
{/if}
