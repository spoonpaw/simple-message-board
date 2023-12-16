<!--src/routes/+layout.svelte-->

<script>
	import '../app.css';
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<slot />
	</div>
</div>

<style lang="postcss">
	/* Styles for links */
	:global(.formatted-content a) {
		@apply text-blue-500 underline cursor-pointer;
	}

	:global(.formatted-content a:hover),
	:global(.formatted-content a:focus) {
		@apply text-blue-700 no-underline;
	}

	/* Minimalist styles for block quotes */
	:global(.formatted-content blockquote) {
		@apply bg-gray-50 border-l-4 border-green-500 px-2 py-1 italic text-gray-800 my-2;
	}

	/* Minimalist styles for code blocks */
	:global(.formatted-content pre) {
		@apply bg-gray-800 text-white p-2 rounded-lg overflow-x-auto;
	}

	/* Styles for headers */
	:global(.formatted-content h1) {
		@apply text-3xl font-semibold my-4;
		/* Adjust font size as needed */
	}

	:global(.formatted-content h2) {
		@apply text-2xl font-semibold my-3;
		/* Adjust font size as needed */
	}

	:global(.formatted-content h3) {
		@apply text-xl font-semibold my-2;
		/* Adjust font size as needed */
	}

	:global(.formatted-content h4) {
		@apply text-lg font-semibold my-2;
		/* Adjust font size as needed */
	}

	:global(.formatted-content h5) {
		@apply text-base font-semibold my-2;
		/* Adjust font size as needed */
	}

	:global(.formatted-content h6) {
		@apply text-sm font-semibold my-2;
		/* Adjust font size as needed */
	}

	/* Compact styles for ordered and unordered lists */
	:global(.formatted-content ol) {
		@apply list-decimal pl-4 my-2;
	}

	:global(.formatted-content ul) {
		@apply list-disc pl-4 my-2;
	}

	:global(.formatted-content li) {
		@apply ml-2;
		/* Add margin to list items for indentation */
	}
</style>
