<!--src/lib/client/components/common/ToastContainer.svelte-->

<script lang="ts">
	import { toastManager } from "../../../../stores/toastManager";
	import Toast from "./Toast.svelte";
</script>

<div class="z-20 fixed bottom-4 right-4 flex flex-col-reverse space-y-2 space-y-reverse">
    {#each $toastManager.slice().reverse() as toast (toast.id)}
        <Toast {toast} />
    {/each}
</div>
