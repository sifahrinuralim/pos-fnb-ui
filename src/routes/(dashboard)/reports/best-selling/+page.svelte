<script lang="ts">
	import { onMount } from 'svelte';
	import { getBestSelling } from '$lib/api/reports';
	import ReportsNav from '$lib/components/reports/ReportsNav.svelte';
	import {
		TrendingUp,
		Trophy,
		Package,
		Coins,
		Filter,
		RefreshCw,
		AlertTriangle,
		UtensilsCrossed
	} from 'lucide-svelte';

	interface BestSellingItem {
		menu_item_name: string;
		total_quantity_sold: number;
		total_revenue: number;
	}

	// ── Helper tanggal & format ──────────────────────────────
	function todayISO(): string {
		const d = new Date();
		return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
	}

	function daysAgoISO(days: number): string {
		const d = new Date();
		d.setDate(d.getDate() - days);
		return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
	}

	function monthStartISO(): string {
		const d = new Date();
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(Number(value) || 0);
	}

	// ── State ───────────────────────────────────────────────
	let startDate = todayISO();
	let endDate = todayISO();
	let limit = 10;
	let items: BestSellingItem[] = [];
	let loading = false;
	let error = '';

	async function fetchData(): Promise<void> {
		loading = true;
		error = '';
		try {
			const res = await getBestSelling(limit, startDate, endDate);
			if (res.success) {
				items = Array.isArray(res.data) ? res.data : [];
			} else {
				error = res.message || 'Gagal memuat laporan.';
			}
		} catch (e: any) {
			error = e?.message ?? 'Terjadi kesalahan saat memuat data.';
		} finally {
			loading = false;
		}
	}

	function applyRange(days: number | 'month'): void {
		if (days === 'month') {
			startDate = monthStartISO();
			endDate = todayISO();
		} else if (days === 0) {
			startDate = todayISO();
			endDate = todayISO();
		} else {
			startDate = daysAgoISO(days);
			endDate = todayISO();
		}
		fetchData();
	}

	onMount(fetchData);

	// ── Turunan ─────────────────────────────────────────────
	$: maxRevenue = Math.max(1, ...items.map((i) => i.total_revenue ?? 0));
	$: totalQty = items.reduce((sum, i) => sum + (i.total_quantity_sold ?? 0), 0);
	$: totalRevenue = items.reduce((sum, i) => sum + (i.total_revenue ?? 0), 0);

	function rankBadgeClass(index: number): string {
		if (index === 0) return 'bg-amber-100 text-amber-700';
		if (index === 1) return 'bg-gray-200 text-gray-700';
		if (index === 2) return 'bg-orange-100 text-orange-700';
		return 'bg-gray-100 text-gray-500';
	}
</script>

<div class="space-y-6">
	<ReportsNav />

	<div>
		<h1 class="text-2xl font-bold text-gray-900">Best Selling</h1>
		<p class="text-sm text-gray-500 mt-1">Menu dengan penjualan terbaik pada periode yang dipilih.</p>
	</div>

	<!-- Filter Bar -->
	<div class="card">
		<div class="flex flex-wrap items-end gap-3">
			<div class="flex flex-col gap-1.5">
				<label for="startDate" class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dari</label>
				<input id="startDate" type="date" bind:value={startDate} class="input-field w-44" />
			</div>
			<span class="text-gray-400 pb-3">→</span>
			<div class="flex flex-col gap-1.5">
				<label for="endDate" class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sampai</label>
				<input id="endDate" type="date" bind:value={endDate} class="input-field w-44" />
			</div>
			<div class="flex flex-col gap-1.5">
				<label for="limit" class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Jumlah Item</label>
				<select id="limit" bind:value={limit} on:change={fetchData} class="input-field w-32">
					<option value={5}>5</option>
					<option value={10}>10</option>
					<option value={20}>20</option>
					<option value={50}>50</option>
					<option value={100}>100</option>
				</select>
			</div>
			<button class="btn-primary inline-flex items-center gap-2" on:click={fetchData} disabled={loading}>
				<Filter class="w-4 h-4" /> Terapkan
			</button>

			<div class="flex flex-wrap items-center gap-2 lg:ml-auto">
				<button class="btn-secondary !py-2 !px-3 text-xs" on:click={() => applyRange(0)}>Hari Ini</button>
				<button class="btn-secondary !py-2 !px-3 text-xs" on:click={() => applyRange(7)}>7 Hari Terakhir</button>
				<button class="btn-secondary !py-2 !px-3 text-xs" on:click={() => applyRange(30)}>30 Hari Terakhir</button>
				<button class="btn-secondary !py-2 !px-3 text-xs" on:click={() => applyRange('month')}>Bulan Ini</button>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			{#each Array(3) as _}
				<div class="card h-24 bg-gray-100 animate-pulse"></div>
			{/each}
		</div>
		<div class="card h-64 bg-gray-100 animate-pulse"></div>
	{:else if error}
		<div class="card border-red-200 bg-red-50">
			<div class="flex items-start gap-3">
				<div class="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 text-red-600 shrink-0">
					<AlertTriangle class="w-5 h-5" />
				</div>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-semibold text-red-700">Gagal memuat laporan</p>
					<p class="text-sm text-red-600 mt-0.5 break-words">{error}</p>
				</div>
				<button class="btn-secondary shrink-0" on:click={fetchData} disabled={loading}>
					<RefreshCw class="w-4 h-4" /> Coba Lagi
				</button>
			</div>
		</div>
	{:else if items.length === 0}
		<div class="card py-12 text-center">
			<UtensilsCrossed class="w-10 h-10 mx-auto text-gray-300" />
			<p class="text-sm text-gray-500 mt-3">Belum ada data menu terlaris untuk periode ini.</p>
		</div>
	{:else}
		<!-- Summary Chips -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<div class="card flex items-center gap-4">
				<div class="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 text-purple-600">
					<Package class="w-6 h-6" />
				</div>
				<div>
					<p class="text-sm text-gray-500">Total Menu</p>
					<p class="text-xl font-bold text-gray-900 mt-0.5 tabular-nums">{items.length}</p>
				</div>
			</div>
			<div class="card flex items-center gap-4">
				<div class="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 text-amber-600">
					<Coins class="w-6 h-6" />
				</div>
				<div>
					<p class="text-sm text-gray-500">Total Terjual</p>
					<p class="text-xl font-bold text-gray-900 mt-0.5 tabular-nums">{totalQty.toLocaleString('id-ID')}</p>
				</div>
			</div>
			<div class="card flex items-center gap-4">
				<div class="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600">
					<TrendingUp class="w-6 h-6" />
				</div>
				<div>
					<p class="text-sm text-gray-500">Total Pendapatan</p>
					<p class="text-xl font-bold text-gray-900 mt-0.5 tabular-nums">{formatCurrency(totalRevenue)}</p>
				</div>
			</div>
		</div>

		<!-- Ranked Table -->
		<div class="card overflow-hidden !p-0">
			<div class="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
				<div class="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-600">
					<Trophy class="w-5 h-5" />
				</div>
				<div>
					<h2 class="text-lg font-semibold text-gray-900">Peringkat Menu Terlaris</h2>
					<p class="text-sm text-gray-500">Diurutkan berdasarkan total pendapatan</p>
				</div>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Peringkat</th>
							<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Menu</th>
							<th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Jumlah Terjual</th>
							<th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Pendapatan</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each items as item, i}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4">
									<span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold {rankBadgeClass(i)}">
										{i + 1}
									</span>
								</td>
								<td class="px-6 py-4">
									<div class="font-medium text-gray-900">{item.menu_item_name}</div>
									<div class="mt-1.5 w-40 h-1.5 bg-gray-100 rounded-full overflow-hidden">
										<div
											class="h-full bg-primary-600 rounded-full transition-all duration-500"
											style="width: {(item.total_revenue / maxRevenue) * 100}%"
										></div>
									</div>
								</td>
								<td class="px-6 py-4 text-right text-gray-700 tabular-nums">
									{Number(item.total_quantity_sold ?? 0).toLocaleString('id-ID')}
								</td>
								<td class="px-6 py-4 text-right font-semibold text-gray-900 tabular-nums">
									{formatCurrency(item.total_revenue)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

