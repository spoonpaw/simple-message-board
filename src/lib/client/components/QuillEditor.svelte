<!--src/lib/client/components/QuillEditor.svelte-->
<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import 'quill/dist/quill.snow.css';
	import type { Quill as QuillType } from 'quill';
	import { fade } from 'svelte/transition';

	const dispatch = createEventDispatcher();
	let quillContainer: HTMLElement;
	let quill: QuillType | undefined;
	export let initialContent: string = '';
	let errorMessage: string = ''; // Add a reactive variable for the error message
	let errorTimeout: number; // Variable to store the timeout ID

	let textChangeHandler: (delta: never, oldDelta: never, source: string) => void;

	export function triggerError(message: string) {
		errorMessage = message;
		startErrorTimeout();
	}

	// Define the async function outside onMount
	async function initializeQuill() {
		const Quill = (await import('quill')).default;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		const ImageUploader = (await import('quill-image-uploader')).default;

		// Bypass TypeScript errors with type assertion
		Quill.register('modules/imageUploader', ImageUploader as never);

		quill = new Quill(quillContainer, {
			theme: 'snow',
			modules: {
				toolbar: [['bold', 'italic', 'underline', 'strike'], ['link', 'image'], ['clean']],
				imageUploader: {
					upload: (file: File) => {
						return new Promise<string>((resolve, reject) => {
							uploadImageToServer(file)
								.then((url) => resolve(url))
								.catch((error) => {
									errorMessage = error.message; // Set the error message
									startErrorTimeout();
									reject(error); // Reject the promise with the error
								});
						});
					}
				}
			},
			scrollingContainer: quillContainer
		});

		if (initialContent) {
			quill.root.innerHTML = initialContent;
		}

		// Define the handler function
		textChangeHandler = () => {
			if (quill) {
				dispatch('textChange', { content: quill.root.innerHTML });
			}
		};

		// Add the event listener using the handler function
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		quill.on('text-change', textChangeHandler);
	}

	onMount(() => {
		// This condition checks if Quill has already been initialized
		if (!quill) {
			initializeQuill();
		} else {
			// If Quill is already initialized, remove the existing toolbar before creating a new one
			removeExtraToolbars();
		}
	});

	onDestroy(() => {
		if (quill) {
			// Remove the event listener using the same handler function
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			quill.off('text-change', textChangeHandler);
			quill = undefined;
		}
		// Clean up any leftover toolbars
		removeExtraToolbars();
	});

	// Utility function to remove extra toolbars
	function removeExtraToolbars() {
		console.log('removeExtraToolbars called');

		// Check if quillContainer is defined
		if (!quillContainer) {
			console.log('quillContainer is undefined');
			return;
		}

		// We need to use a type guard to ensure we're working with an Element
		let previousSibling: Element | null = quillContainer.previousElementSibling;

		while (previousSibling) {
			if (previousSibling.classList.contains('ql-toolbar')) {
				console.log('Removing previous sibling toolbar');
				previousSibling.remove();
				break; // Assuming only one toolbar needs to be removed
			}
			previousSibling = previousSibling.previousElementSibling;
		}
	}

	async function uploadImageToServer(file: File): Promise<string> {
		console.log('Uploading image to server:', file.name);

		// Client-side validation
		const maxFileSize = 5 * 1024 * 1024; // 5MB

		if (!file.type.startsWith('image/')) {
			throw new Error('File is not an image');
		}

		if (file.size > maxFileSize) {
			throw new Error('Image is too large. Maximum size is 5MB.');
		}

		const formData = new FormData();
		formData.append('file', file);

		try {
			console.log('Sending request to server...');
			const response = await fetch('/post/image', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Server error');
			}

			const data = await response.json();

			if (!data.fileUrl || typeof data.fileUrl !== 'string') {
				throw new Error('Invalid response format');
			}

			console.log('Image uploaded successfully:', data.fileUrl);
			return data.fileUrl;
		} catch (error) {
			console.error('Upload failed:', error);
			errorMessage =
				error instanceof Error ? 'Upload failed: ' + error.message : 'An unknown error occurred';
			startErrorTimeout();
			throw error; // Re-throw the error to maintain consistency with the function's return type
		}
	}

	function startErrorTimeout() {
		if (errorTimeout) clearTimeout(errorTimeout);
		errorTimeout = setTimeout(() => {
			errorMessage = '';
		}, 5000) as unknown as number; // Cast to `number`
	}
</script>

<div bind:this={quillContainer}></div>
{#if errorMessage}
	<!-- Conditionally display the error message -->
	<div
		class="bg-red-50 border-l-4 border-red-400 p-2 text-red-600"
		role="alert"
		in:fade={{ duration: 300 }}
		out:fade={{ duration: 300 }}
	>
		<span class="block sm:inline">{errorMessage}</span>
	</div>
{/if}

<style>
	/* Style for the Quill editor container */
	:global(.ql-container) {
		max-height: 300px; /* Adjust the max-height as needed */
		overflow-y: auto; /* Enables vertical scrolling */
		border-radius: 0.25rem; /* Add rounded corners */
	}

	:global(.ql-toolbar) {
		border-radius: 0.25rem;
	}
</style>
