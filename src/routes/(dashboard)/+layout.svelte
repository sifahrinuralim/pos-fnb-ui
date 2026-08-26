<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import {
		LayoutDashboard,
		ShoppingCart,
		UtensilsCrossed,
		Tag,
		SlidersHorizontal,
		LayoutGrid,
		ClipboardList,
		Package,
		BarChart3,
		Users,
		Store,
		LogOut,
		Menu,
		X,
		ChevronRight,
		CreditCard,
		User
	} from 'lucide-svelte';

	let sidebarOpen = false;
	let isLoggingOut = false;

	interface NavItem {
		href: string;
		label: string;
		icon: typeof LayoutDashboard;
	}

	const mainNav: NavItem[] = [
		{ href: '/', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/pos', label: 'Kasir (POS)', icon: ShoppingCart },
		{ href: '/menu-items', label: 'Menu & Produk', icon: UtensilsCrossed },
		{ href: '/categories', label: 'Kategori', icon: Tag },
		{ href: '/tables', label: 'Meja', icon: LayoutGrid },
		{ href: '/orders', label: 'Pesanan', icon: ClipboardList },
		{ href: '/payments', label: 'Pembayaran', icon: CreditCard },
		{ href: '/inventory/stocks', label: 'Inventaris', icon: Package },
		{ href: '/reports/sales-summary', label: 'Laporan', icon: BarChart3 },
		{ href: '/discounts', label: 'Diskon & Promo', icon: Tag },
	];

	const settingsNav: NavItem[] = [
		{ href: '/users', label: 'Pengguna', icon: Users },
		{ href: '/settings/store', label: 'Outlet', icon: Store },
		{ href: '/settings/tax', label: 'Pajak', icon: SlidersHorizontal }
	];

	$: if (browser && $authStore.loaded && !$authStore.isAuthenticated) {
		goto('/login');
	}

	function isActive(href: string): boolean {
		const path = $page.url.pathname;
		if (href === '/') return path === '/';
		// Jaga menu "Laporan" tetap aktif di semua sub-halaman laporan (/reports/*)
		if (href.startsWith('/reports/')) return path.startsWith('/reports/');
		return path.startsWith(href);
	}

	async function handleLogout(): Promise<void> {
		if (isLoggingOut) return;
		isLoggingOut = true;
		await authStore.logout();
	}
</script>

<svelte:head>
	<title>POS F&B — {$page.url.pathname === '/' ? 'Dashboard' : 'POS'}</title>
</svelte:head>

{#if $authStore.isAuthenticated}
	<div class="min-h-screen flex bg-gray-50">
		{#if sidebarOpen}
			<button class="fixed inset-0 z-40 bg-black/50 lg:hidden" on:click={() => (sidebarOpen = false)} aria-label="Tutup sidebar" />
		{/if}

		<aside
			class="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0
			{sidebarOpen ? 'translate-x-0' : '-translate-x-full'}">
			<div class="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
				<div class="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-xl">
					<span class="text-sm font-extrabold text-white">POS</span>
				</div>
				<div>
					<h1 class="text-base font-bold leading-tight">F&B System</h1>
					<p class="text-xs text-gray-400">Point of Sale</p>
				</div>
				<button class="ml-auto lg:hidden text-gray-400 hover:text-white" on:click={() => (sidebarOpen = false)}>
					<X class="w-5 h-5" />
				</button>
			</div>

			<nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
				<p class="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu Utama</p>
				{#each mainNav as item}
					<a
						href={item.href}
						on:click={() => (sidebarOpen = false)}
						class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
						{isActive(item.href) ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}"
					>
						<svelte:component this={item.icon} class="w-5 h-5 shrink-0" />
						<span>{item.label}</span>
						{#if isActive(item.href)}
							<ChevronRight class="w-4 h-4 ml-auto" />
						{/if}
					</a>
				{/each}

				<div class="pt-4 pb-2">
					<p class="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengaturan</p>
				</div>
				{#each settingsNav as item}
					<a
						href={item.href}
						on:click={() => (sidebarOpen = false)}
						class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
						{isActive(item.href) ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}"
					>
						<svelte:component this={item.icon} class="w-5 h-5 shrink-0" />
						<span>{item.label}</span>
					</a>
				{/each}
			</nav>

			<div class="border-t border-gray-800 px-4 py-4">
				<div class="flex items-center gap-3">
					<div class="flex items-center justify-center w-9 h-9 bg-gray-700 rounded-full">
						<User class="w-5 h-5 text-gray-300" />
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-white truncate">{$authStore.user?.name ?? 'User'}</p>
						<p class="text-xs text-gray-400 truncate">{$authStore.user?.role ?? '—'}</p>
					</div>
				</div>
				<button
					on:click={handleLogout}
					disabled={isLoggingOut}
					class="mt-3 flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 rounded-lg hover:bg-gray-800 hover:text-red-400 disabled:opacity-50 transition-colors duration-150"
				>
					<LogOut class="w-4 h-4" />
					<span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
				</button>
			</div>
		</aside>

		<div class="flex-1 lg:ml-64">
			<header class="sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b border-gray-200 sm:px-6 lg:px-8">
				<button
					on:click={() => (sidebarOpen = true)}
					class="p-2 -ml-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100"
					aria-label="Buka sidebar"
				>
					<Menu class="w-6 h-6" />
				</button>
				<div class="flex-1" />
				<div class="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
					<span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
					<span class="text-xs font-medium text-green-700">Online</span>
				</div>
			</header>

			<main class="p-4 sm:p-6 lg:p-8">
				<slot />
			</main>
		</div>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center">
		<div class="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
	</div>
{/if}
