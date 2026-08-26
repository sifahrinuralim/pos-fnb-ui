<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import {
		ShoppingCart,
		ClipboardList,
		Package,
		BarChart3
	} from 'lucide-svelte';

	const stats = [
		{ label: 'Penjualan Hari Ini', value: 'Rp 0', icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
		{ label: 'Pesanan Aktif', value: '0', icon: ClipboardList, color: 'bg-amber-50 text-amber-600' },
		{ label: 'Total Produk', value: '0', icon: Package, color: 'bg-green-50 text-green-600' },
		{ label: 'Laporan', value: '—', icon: BarChart3, color: 'bg-purple-50 text-purple-600' }
	];
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
		<p class="text-sm text-gray-500 mt-1">
			Selamat datang kembali, <span class="font-medium text-gray-700">{$authStore.user?.name ?? 'User'}</span>
		</p>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each stats as stat}
			<div class="card flex items-start gap-4">
				<div class="flex items-center justify-center w-12 h-12 rounded-xl {stat.color}">
					<svelte:component this={stat.icon} class="w-6 h-6" />
				</div>
				<div>
					<p class="text-sm text-gray-500">{stat.label}</p>
					<p class="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
				</div>
			</div>
		{/each}
	</div>

	<div class="card">
		<h2 class="text-lg font-semibold text-gray-900 mb-2">Mulai Bekerja</h2>
		<p class="text-sm text-gray-500 mb-4">
			Pilih menu dari sidebar untuk mulai mengelola bisnis F&B Anda.
		</p>
		<div class="flex flex-wrap gap-3">
			<a href="/pos" class="btn-primary inline-flex items-center gap-2">
				<ShoppingCart class="w-4 h-4" />
				Buka Kasir
			</a>
			<a href="/products" class="btn-secondary inline-flex items-center gap-2">
				<Package class="w-4 h-4" />
				Kelola Menu
			</a>
		</div>
	</div>
</div>
