<!--src/routes/quill-rich-text/+page.svelte-->

<script lang="ts">
	import { onMount } from 'svelte';
	import 'quill/dist/quill.snow.css';
	import type { Quill as QuillType } from 'quill';

	let quill: QuillType | undefined;
	export let textContent = '';

	onMount(async () => {
		const Quill = (await import('quill')).default;
		quill = new Quill('#editor', {
			theme: 'snow',
			modules: {
				toolbar: [
					[{ header: [1, 2, 3, false] }], // Style selectors (headings)
					['bold', 'italic', 'underline', 'strike'], // Bold, italic, underline, and strikethrough
					[{ list: 'ordered' }, { list: 'bullet' }], // Ordered and unordered lists
					['link', 'image'], // Link and image inserters
					['clean'] // Format remover
				]
			}
		});

		quill.on('text-change', () => {
			if (quill) {
				textContent = quill.root.innerHTML;
			}
		});

		if (quill && textContent) {
			quill.clipboard.dangerouslyPasteHTML(textContent);
		}
	});
</script>

<div id="editor"></div>
