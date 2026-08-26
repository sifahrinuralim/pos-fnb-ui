<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { Loader2 } from 'lucide-svelte';

	onMount(() => {
		if ($authStore.isAuthenticated) {
			// TODO: Redirect to main POS dashboard
			// For now, show a simple landing
		} else {
			goto('/login');
		}
	});
</script>

<svelte:head>
	<title>POS F&B — Dashboard</title>
</svelte:head>

{#if $authStore.isAuthenticated}
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center">
			<h1 class="text-3xl font-bold text-gray-900">POS F&B Dashboard</h1>
			<p class="text-gray-500 mt-2">
				Selamat datang, <span class="font-semibold text-gray-700">{$authStore.user?.name}</span>
			</p>
			<p class="text-sm text-gray-400 mt-1">
				Role: {$authStore.user?.role}
			</p>
		</div>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center">
		<Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
	</div>
{/if}
