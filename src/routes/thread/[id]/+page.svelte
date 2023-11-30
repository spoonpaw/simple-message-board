<script lang="ts">
	import type {PageServerData} from './$types';
	import {goto} from '$app/navigation';
	import {LogoutButton} from '$lib/client';
	import {Icon} from '@steeze-ui/svelte-icon';
	import {ArrowLeftCircle, Pin, Lock} from '@steeze-ui/lucide-icons';

	export let data: PageServerData;
	const {username, thread} = data;

	function navigateToCategory() {
		goto(`/category/${thread.category_id}`);
	}
</script>

<div class="min-h-screen bg-gray-50">
    <div class="container mx-auto py-8 px-4 sm:px-0">
        <div class="flex justify-between items-center mb-6">
            <div>
                <button on:click={navigateToCategory}
                        class="text-blue-500 hover:text-blue-700 font-bold flex items-center">
                    <Icon src={ArrowLeftCircle} class="w-5 h-5 mr-1 align-text-bottom"/>
                    Back to Category: {thread.category_title}
                </button>

                <h1 class="text-3xl font-semibold text-gray-800 mt-2">Thread: {thread.title}</h1>
                <div>
                    {#if thread.pinned}
                        <Icon src={Pin} class="inline-block w-5 h-5 mr-2"/>
                    {/if}
                    {#if thread.locked}
                        <Icon src={Lock} class="inline-block w-5 h-5 mr-2"/>
                    {/if}
                </div>
            </div>
            <div>
                <div class="text-lg text-gray-600">Hi {username}!</div>
                <LogoutButton/> <!-- LogoutButton component -->
            </div>
        </div>

        <!-- Thread Content and Posts -->
        <div class="mb-4">
            <!-- Display posts here -->
            {#each thread.posts as post (post.id)}
                <div class="bg-white shadow p-4 rounded-lg mt-4">
                    <p class="font-semibold">{post.authorUsername}</p>
                    <p>{post.content}</p>
                    <p class="text-sm text-gray-500">Posted on: {new Date(post.createdAt).toLocaleString()}</p>
                </div>
            {/each}
        </div>
    </div>
</div>
