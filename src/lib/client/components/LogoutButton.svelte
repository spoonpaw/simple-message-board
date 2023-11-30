<script>
    import { goto } from '$app/navigation';

    async function logout() {
        const response = await fetch('/logout', { method: 'GET' });
        if (response.ok) {
            await goto('/');
        } else {
            console.error('Logout failed');
        }
    }
</script>

<button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
        on:click={logout}
>
    Logout
</button>
