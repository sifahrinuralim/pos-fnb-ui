<script lang="ts">
	import { page } from '$app/stores';
	import { Package, Boxes, AlertTriangle } from 'lucide-svelte';

	interface TabItem {
		href: string;
		label: string;
		icon: typeof Package;
	}

	const tabs: TabItem[] = [
		{ href: '/inventory/ingredients', label: 'Bahan Baku', icon: Package },
		{ href: '/inventory/stocks', label: 'Stok', icon: Boxes },
		{ href: '/inventory/low-stock', label: 'Low Stock', icon: AlertTriangle }
	];
</script>

<nav class="inline-flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm w-full overflow-x-auto sm:w-fit">
	{#each tabs as tab}
		<a
			href={tab.href}
			class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors duration-150
				{$page.url.pathname === tab.href
					? 'bg-primary-600 text-white shadow-sm'
					: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
		>
			<svelte:component this={tab.icon} class="w-4 h-4" />
			<span>{tab.label}</span>
		</a>
	{/each}
</nav>
