<script lang="ts">
	import { onMount } from 'svelte';
	import { AlertTriangle, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-svelte';
	import { inventoryStore } from '$lib/stores/inventory';
	import InventoryNav from '$lib/components/inventory/InventoryNav.svelte';

	let errorMessage = '';

	$: lowStockItems = $inventoryStore.lowStockItems;
	$: loading = $inventoryStore.loading;

	onMount(() => {
		inventoryStore.loadLowStock().catch((err: unknown) => {
			const e = err as { message?: string };
			errorMessage = e.message || 'Gagal memuat data low stock.';
		});
	});

	function formatRupiah(value: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(value);
	}
</script>

<div class="space-y-6">
	<header>
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Low Stock</h1>
				<p class="mt-1 text-sm text-gray-500">Bahan baku yang stoknya berada di bawah / sama dengan batas minimum.</p>
			</div>
			<a href="/inventory/stocks" class="btn-secondary inline-flex items-center gap-2">
				Kelola Stok
				<ArrowRight class="h-4 w-4" />
			</a>
		</div>
		<div class="mt-4">
			<InventoryNav />
		</div>
	</header>

	{#if errorMessage}
		<div class="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			<AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
			<span>{errorMessage}</span>
		</div>
	{/if}

	{#if !loading && lowStockItems.length > 0}
		<div class="flex items-start gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 shrink-0">
				<AlertTriangle class="h-5 w-5" />
			</div>
			<div>
				<p class="font-semibold text-red-800">{lowStockItems.length} bahan baku membutuhkan restock.</p>
				<p class="text-sm text-red-600">Segera tambah stok agar operasional tetap berjalan.</p>
			</div>
		</div>
	{/if}
	<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Bahan Baku</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Satuan</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Stok Saat Ini</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Stok Minimum</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Harga Satuan</th>
						<th scope="col" class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#if loading && lowStockItems.length === 0}
						<tr>
							<td colspan="6" class="px-6 py-12 text-center">
								<Loader2 class="mx-auto h-6 w-6 animate-spin text-gray-400" />
								<p class="mt-2 text-sm text-gray-500">Memuat data low stock...</p>
							</td>
						</tr>
					{:else if lowStockItems.length === 0}
						<tr>
							<td colspan="6" class="px-6 py-12 text-center">
								<CheckCircle2 class="mx-auto h-10 w-10 text-green-300" />
								<p class="mt-2 text-sm font-medium text-gray-500">Semua stok dalam kondisi aman.</p>
								<p class="text-sm text-gray-400">Tidak ada bahan baku yang berada di bawah batas minimum.</p>
							</td>
						</tr>
					{:else}
						{#each lowStockItems as item}
							<tr class="bg-red-50/50 transition hover:bg-red-100">
								<td class="px-6 py-4 text-sm font-semibold text-gray-900">{item.ingredient_name}</td>
								<td class="px-6 py-4 text-sm text-gray-600">{item.unit}</td>
								<td class="px-6 py-4 text-sm font-bold text-red-700">{item.stock_quantity}</td>
								<td class="px-6 py-4 text-sm text-gray-600">{item.minimum_stock}</td>
								<td class="px-6 py-4 text-sm text-gray-600">{formatRupiah(item.unit_price)}</td>
								<td class="px-6 py-4">
									<span class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
										<AlertTriangle class="h-3 w-3" />
										Low Stock
									</span>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

