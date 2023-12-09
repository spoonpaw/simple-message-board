<script lang="ts">
	import QuillEditor from '$lib/client/components/QuillEditor.svelte';

	let initialEditorContent = '<p>Hello World!</p>';
	let currentEditorContent = '<p>Hello World!</p>';
	let quillEditor: QuillEditor; // Reference to the QuillEditor component

	function handleTextChange(event: CustomEvent) {
		currentEditorContent = event.detail.content;
	}

	function triggerEditorError() {
		if (quillEditor) {
			quillEditor.triggerError('This is a test error.');
		}
	}
</script>

<QuillEditor
	bind:this={quillEditor}
	initialContent={initialEditorContent}
	on:textChange={handleTextChange}
/>

<button
	class="mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
	on:click={() => console.log(currentEditorContent)}
>
	Submit
</button>

<button
	class="mt-4 ml-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300"
	on:click={triggerEditorError}
>
	Trigger Error
</button>
