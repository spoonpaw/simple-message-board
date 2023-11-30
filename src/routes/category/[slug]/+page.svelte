<!-- src/routes/category/[slug]/+page.svelte -->

<script lang="ts">
	import type {PageServerData} from './$types';
	import {goto} from '$app/navigation';
	import {Icon} from '@steeze-ui/svelte-icon';
	import {Pin, Lock} from '@steeze-ui/lucide-icons';

	export let data: PageServerData;
	const {username, category, threads} = data;

	async function logout() {
		const response = await fetch('/logout', {method: 'GET'});
		if (response.ok) {
			window.location.href = '/';
		} else {
			console.error('Logout failed');
		}
	}

	function navigateToBoard() {
		goto('/board');
	}
</script>

<div class="min-h-screen bg-gray-50">
    <div class="container mx-auto py-8 px-4 sm:px-0">
        <div class="flex justify-between items-center mb-6">
            <div>
                <button
                        on:click={navigateToBoard}
                        class="text-blue-500 hover:text-blue-700 font-bold"
                >
                    ← Back to Main Board
                </button>
                <h1 class="text-3xl font-semibold text-gray-800 mt-2">Category: {category.title}</h1>
            </div>
            <div>
                <div class="text-lg text-gray-600">Hi {username}!</div>
                <button
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                        on:click={logout}
                >
                    Logout
                </button>
            </div>
        </div>
        <p class="text-gray-600 mb-4">{category.description}</p>

        <div class="flex flex-wrap justify-center gap-6 items-stretch">
            {#each threads as thread (thread.id)}
                <a href={`/thread/${thread.id}`} class="block w-full md:w-1/2 lg:w-1/3 p-4">
                    <div class="bg-white shadow-lg rounded-lg p-6 transition duration-150 ease-in-out hover:shadow-xl">
                        <h2 class="text-xl font-semibold text-blue-600 mb-1">{thread.title}</h2>
                        <div class="text-gray-600 mb-2">
                            {#if thread.pinned}
                                <Icon src={Pin} class="inline-block w-5 h-5 mr-1"/>
                            {/if}
                            {#if thread.locked}
                                <Icon src={Lock} class="inline-block w-5 h-5 mr-1"/>
                            {/if}
                        </div>
                        <div class="text-sm text-gray-500">
                            <p>Started by {thread.creator_username}</p>
                            <p>{thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}</p>
                            {#if thread.reply_count > 0}
                                <p>Last reply by {thread.last_replier_username}</p>
                            {/if}
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    </div>
</div>
