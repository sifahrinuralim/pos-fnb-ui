<script lang="ts">
	import { onMount } from 'svelte';
	import { listRecentPayments, type Payment } from '$lib/api/payments';
	import {
		Banknote,
		CreditCard,
		QrCode,
		Search,
		RefreshCw,
		Inbox,
		CalendarRange,
		Wallet,
		Filter,
		AlertTriangle
	} from 'lucide-svelte';

	// ── Config ─────────────────────────────────────────────
	const methodConfig: Record<string, { label: string; icon: typeof Banknote; badge: string }> = {
		cash: { label: 'Tunai', icon: Banknote, badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
		qris: { label: 'QRIS', icon: QrCode, badge: 'bg-sky-50 text-sky-700 ring-sky-200' },
		card: { label: 'Kartu', icon: CreditCard, badge: 'bg-violet-50 text-violet-700 ring-violet-200' }
	};

	const statusConfig: Record<string, { label: string; badge: string }> = {
		completed: { label: 'Lunas', badge: 'bg-green-100 text-green-700' },
		pending: { label: 'Menunggu', badge: 'bg-amber-100 text-amber-700' },
		failed: { label: 'Gagal', badge: 'bg-red-100 text-red-700' }
	};

	const statusFilters: { value: 'all' | Payment['status']; label: string }[] = [
		{ value: 'all', label: 'Semua Status' },
		{ value: 'completed', label: 'Lunas' },
		{ value: 'pending', label: 'Menunggu' },
		{ value: 'failed', label: 'Gagal' }
	];

	// ── State ──────────────────────────────────────────────
	let payments: Payment[] = [];
	let loading = true;
	let error = '';
	let searchOrder = '';
	let dateFrom = '';
	let dateTo = '';
	let statusFilter: 'all' | Payment['status'] = 'all';

	async function loadPayments(): Promise<void> {
		loading = true;
		error = '';
		try {
			const res = await listRecentPayments(0, 200);
			if (res.success) {
				payments = Array.isArray(res.data) ? res.data : [];
			} else {
				error = res.message || 'Gagal memuat pembayaran.';
			}
		} catch (e: any) {
			error = e?.message ?? 'Terjadi kesalahan saat memuat data.';
		} finally {
			loading = false;
		}
	}

	onMount(loadPayments);

	function resetFilters(): void {
		searchOrder = '';
		dateFrom = '';
		dateTo = '';
		statusFilter = 'all';
	}

	// ── Derived ────────────────────────────────────────────
	$: filtered = payments.filter((p) => {
		if (searchOrder && !String(p.order_id ?? '').toLowerCase().includes(searchOrder.toLowerCase())) {
			return false;
		}
		if (statusFilter !== 'all' && p.status !== statusFilter) return false;
		if (p.created_at) {
			const d = new Date(p.created_at);
			if (dateFrom && d < new Date(`${dateFrom}T00:00:00`)) return false;
			if (dateTo) {
				const end = new Date(`${dateTo}T23:59:59.999`);
				if (d > end) return false;
			}
		}
		return true;
	});

	$: totalAmount = filtered.reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
	$: hasFilter = !!(searchOrder || dateFrom || dateTo || statusFilter !== 'all');

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(Number(value) || 0);
	}

	function formatDate(value: string): string {
		if (!value) return '—';
		return new Date(value).toLocaleString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Daftar Pembayaran — POS F&B</title>
</svelte:head>

<div class="mx-auto max-w-6xl">
	<!-- Header -->
	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<div class="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600">
				<Wallet class="w-6 h-6" />
			</div>
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Daftar Pembayaran</h1>
				<p class="text-sm text-gray-500">Riwayat transaksi pembayaran order</p>
			</div>
		</div>
		<button class="btn-secondary" on:click={loadPayments} disabled={loading}>
			<RefreshCw class="w-4 h-4 {loading ? 'animate-spin' : ''}" /> Muat Ulang
		</button>
	</div>

	<!-- Ringkasan cepat -->
	<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div class="card flex items-center gap-4 !p-4">
			<div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-600">
				<Wallet class="w-5 h-5" />
			</div>
			<div>
				<p class="text-xs text-gray-500">Total Transaksi</p>
				<p class="text-lg font-bold text-gray-900">{filtered.length.toLocaleString('id-ID')}</p>
			</div>
		</div>
		<div class="card flex items-center gap-4 !p-4">
			<div class="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600">
				<Banknote class="w-5 h-5" />
			</div>
			<div>
				<p class="text-xs text-gray-500">Total Nominal</p>
				<p class="text-lg font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
			</div>
		</div>
		<div class="card flex items-center gap-4 !p-4">
			<div class="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-600">
				<CalendarRange class="w-5 h-5" />
			</div>
			<div>
				<p class="text-xs text-gray-500">Periode Filter</p>
				<p class="text-lg font-bold text-gray-900">{dateFrom && dateTo ? `${dateFrom} s/d ${dateTo}` : dateFrom || dateTo || 'Semua'}</p>
			</div>
		</div>
	</div>

	<!-- Filter bar -->
	<div class="card mb-6 !p-4">
		<div class="grid grid-cols-1 gap-3 md:grid-cols-12">
			<div class="relative md:col-span-4">
				<Search class="pointer-events-none absolute top-1/2 left-3.5 w-4 h-4 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					placeholder="Cari Order ID..."
					aria-label="Cari berdasarkan order id"
					bind:value={searchOrder}
					class="input-field pl-10"
				/>
			</div>
			<div class="md:col-span-2">
				<input type="date" aria-label="Dari tanggal" bind:value={dateFrom} class="input-field" />
			</div>
			<div class="md:col-span-2">
				<input type="date" aria-label="Sampai tanggal" bind:value={dateTo} class="input-field" />
			</div>
			<div class="md:col-span-2">
				<select aria-label="Filter status" bind:value={statusFilter} class="input-field">
					{#each statusFilters as s}
						<option value={s.value}>{s.label}</option>
					{/each}
				</select>
			</div>
			<div class="flex items-center gap-2 md:col-span-2">
				{#if hasFilter}
					<button class="btn-secondary w-full" on:click={resetFilters}>
						<Filter class="w-4 h-4" /> Reset
					</button>
				{/if}
			</div>
		</div>
	</div>

	{#if loading}
		<div class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
			<div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
			<p class="mt-3 text-sm text-gray-500">Memuat pembayaran...</p>
		</div>
	{:else if error}
		<div class="card flex items-start gap-4 border-red-200 bg-red-50">
			<div class="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 text-red-600 shrink-0">
				<AlertTriangle class="w-5 h-5" />
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-sm font-semibold text-red-700">Gagal memuat data</p>
				<p class="mt-0.5 text-sm text-red-600 break-words">{error}</p>
			</div>
			<button class="btn-secondary shrink-0" on:click={loadPayments}>
				<RefreshCw class="w-4 h-4" /> Coba Lagi
			</button>
		</div>
	{:else if filtered.length === 0}
		<div class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20">
			<Inbox class="h-10 w-10 text-gray-300" />
			<p class="mt-3 text-sm font-medium text-gray-700">
				{hasFilter ? 'Tidak ada pembayaran yang cocok dengan filter' : 'Belum ada pembayaran'}
			</p>
			{#if hasFilter}
				<button class="btn-secondary mt-4" on:click={resetFilters}>Reset Filter</button>
			{/if}
		</div>
	{:else}
		<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
			<div class="overflow-x-auto">
				<table class="w-full min-w-[760px] text-sm">
					<thead>
						<tr class="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
							<th class="px-5 py-3.5">Order ID</th>
							<th class="px-5 py-3.5">Tanggal</th>
							<th class="px-5 py-3.5">Jumlah</th>
							<th class="px-5 py-3.5">Metode</th>
							<th class="px-5 py-3.5">Status</th>
							<th class="px-5 py-3.5">Referensi</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each filtered as p (p.id)}
							<tr class="transition hover:bg-gray-50/70">
								<td class="px-5 py-4">
									<a
										href="/orders/{p.order_id}"
										class="font-mono text-xs font-medium text-primary-600 hover:underline"
									>
										#{p.order_id}
									</a>
								</td>
								<td class="px-5 py-4 text-gray-600 whitespace-nowrap">{formatDate(p.created_at)}</td>
								<td class="px-5 py-4 font-bold text-gray-900 tabular-nums whitespace-nowrap">
									{formatCurrency(p.amount)}
								</td>
								<td class="px-5 py-4">
									{#if methodConfig[p.method]}
										<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 {methodConfig[p.method].badge}">
											<svelte:component this={methodConfig[p.method].icon} class="w-3.5 h-3.5" />
											{methodConfig[p.method].label}
										</span>
									{:else}
										<span class="capitalize text-gray-500">{p.method}</span>
									{/if}
								</td>
								<td class="px-5 py-4">
									<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium {statusConfig[p.status]?.badge ?? 'bg-gray-100 text-gray-700'}">
										{statusConfig[p.status]?.label ?? p.status}
									</span>
								</td>
								<td class="px-5 py-4">
									<span class="font-mono text-xs text-gray-500">{p.reference_id ?? '—'}</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-3">
				<p class="text-xs text-gray-500">
					Menampilkan <span class="font-semibold text-gray-700">{filtered.length}</span> dari{' '}
					<span class="font-semibold text-gray-700">{payments.length}</span> pembayaran
				</p>
				<p class="text-xs text-gray-400">Urut berdasarkan terbaru</p>
			</div>
		</div>
	{/if}
</div>
