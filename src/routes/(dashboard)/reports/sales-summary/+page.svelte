<script lang="ts">
	import { onMount } from 'svelte';
	import { getSalesSummary } from '$lib/api/reports';
	import ReportsNav from '$lib/components/reports/ReportsNav.svelte';
	import {
		Banknote,
		BadgePercent,
		Wallet,
		Receipt,
		LineChart,
		CalendarRange,
		PieChart,
		Filter,
		RefreshCw,
		AlertTriangle
	} from 'lucide-svelte';

	interface PaymentBreakdown {
		method: string;
		total: number;
	}

	interface SalesSummaryData {
		period: string;
		total_gross_revenue: number;
		total_discount_amount: number;
		net_revenue: number;
		total_transactions: number;
		average_order_value: number;
		payment_breakdown: PaymentBreakdown[];
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
	let data: SalesSummaryData | null = null;
	let loading = false;
	let error = '';

	async function fetchData(): Promise<void> {
		loading = true;
		error = '';
		try {
			const res = await getSalesSummary(startDate, endDate);
			if (res.success) {
				data = res.data as SalesSummaryData;
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
	const paymentColors = [
		'bg-primary-600',
		'bg-emerald-500',
		'bg-amber-500',
		'bg-purple-500',
		'bg-rose-500',
		'bg-cyan-500'
	];

	const statCards = [
		{ key: 'gross', label: 'Pendapatan Bruto', icon: Banknote, color: 'bg-blue-50 text-blue-600' },
		{ key: 'discount', label: 'Total Diskon', icon: BadgePercent, color: 'bg-amber-50 text-amber-600' },
		{ key: 'net', label: 'Pendapatan Bersih', icon: Wallet, color: 'bg-emerald-50 text-emerald-600' },
		{ key: 'transactions', label: 'Total Transaksi', icon: Receipt, color: 'bg-purple-50 text-purple-600' },
		{ key: 'aov', label: 'Rata-rata Nilai Pesanan', icon: LineChart, color: 'bg-indigo-50 text-indigo-600' },
		{ key: 'period', label: 'Periode', icon: CalendarRange, color: 'bg-gray-100 text-gray-600' }
	];

	$: payments = data?.payment_breakdown ?? [];
	$: maxPayment = Math.max(1, ...payments.map((p) => p.total));
</script>

<div class="space-y-6">
	<ReportsNav />

	<div>
		<h1 class="text-2xl font-bold text-gray-900">Sales Summary</h1>
		<p class="text-sm text-gray-500 mt-1">Ringkasan performa penjualan pada periode yang dipilih.</p>
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
		<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
			{#each Array(6) as _}
				<div class="card h-28 bg-gray-100 animate-pulse"></div>
			{/each}
		</div>
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
	{:else if data}
		<!-- Stat Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
			{#each statCards as card}
				<div class="card flex items-start gap-4">
					<div class="flex items-center justify-center w-12 h-12 rounded-xl {card.color} shrink-0">
						<svelte:component this={card.icon} class="w-6 h-6" />
					</div>
					<div class="min-w-0">
						<p class="text-sm text-gray-500">{card.label}</p>
						<p class="text-lg font-bold text-gray-900 mt-0.5 break-words">
							{#if card.key === 'gross'}
								{formatCurrency(data.total_gross_revenue)}
							{:else if card.key === 'discount'}
								{formatCurrency(data.total_discount_amount)}
							{:else if card.key === 'net'}
								{formatCurrency(data.net_revenue)}
							{:else if card.key === 'transactions'}
								{Number(data.total_transactions ?? 0).toLocaleString('id-ID')}
							{:else if card.key === 'aov'}
								{formatCurrency(data.average_order_value)}
							{:else}
								{data.period ?? '—'}
							{/if}
						</p>
					</div>
				</div>
			{/each}
		</div>

		<!-- Payment Method Breakdown -->
		<div class="card">
			<div class="flex items-center gap-3 mb-6">
				<div class="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 text-rose-600">
					<PieChart class="w-5 h-5" />
				</div>
				<div>
					<h2 class="text-lg font-semibold text-gray-900">Rincian Metode Pembayaran</h2>
					<p class="text-sm text-gray-500">Distribusi pendapatan per metode pembayaran</p>
				</div>
			</div>

			{#if payments.length > 0}
				<div class="space-y-5">
					{#each payments as item, i}
						<div>
							<div class="flex items-center justify-between gap-4 text-sm mb-1.5">
								<span class="font-medium text-gray-700 capitalize">{item.method}</span>
								<div class="flex items-center gap-3 shrink-0">
									<span class="text-xs text-gray-400 tabular-nums">
										{data.net_revenue > 0 ? ((item.total / data.net_revenue) * 100).toFixed(1) : '0.0'}%
									</span>
									<span class="font-semibold text-gray-900 tabular-nums">{formatCurrency(item.total)}</span>
								</div>
							</div>
							<div class="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
								<div
									class="h-full rounded-full transition-all duration-500 {paymentColors[i % paymentColors.length]}"
									style="width: {(item.total / maxPayment) * 100}%"
								></div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="py-10 text-center">
					<PieChart class="w-10 h-10 mx-auto text-gray-300" />
					<p class="text-sm text-gray-500 mt-3">Belum ada data metode pembayaran untuk periode ini.</p>
				</div>
			{/if}
		</div>
	{:else}
		<div class="card py-12 text-center">
			<LineChart class="w-10 h-10 mx-auto text-gray-300" />
			<p class="text-sm text-gray-500 mt-3">Pilih rentang tanggal lalu klik "Terapkan" untuk memuat laporan.</p>
		</div>
	{/if}
</div>
