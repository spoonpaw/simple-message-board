<!--src/lib/client/components/common/Navbar.svelte-->
<script lang="ts">

	import {Icon} from "@steeze-ui/svelte-icon";
	import UserStatusHeader from "$lib/client/components/userStatusHeader/UserStatusHeader.svelte";
	import type {IconSource} from "@steeze-ui/lucide-icons";

	export let iconSrc: IconSource;
	export let text: string;
	export let onIconClick: () => void;
	export let isLoggedIn: boolean;
	export let username: string;
	export let userId: string = '';
	export let canAccessAdminPanel: boolean;
</script>

<nav class="flex justify-between items-center pb-2 bg-gray-50">
    <div class="flex items-center">
        <button
                on:click={onIconClick}
                class="flex items-center text-blue-500 hover:text-blue-700 font-bold"
        >
            <Icon src={iconSrc} class="w-5 h-5 mr-2 flex-shrink-0"/> <!-- Added flex-shrink-0 here -->
            {text}
        </button>
    </div>
    <UserStatusHeader {isLoggedIn} {username} {userId} {canAccessAdminPanel}/>
</nav>
