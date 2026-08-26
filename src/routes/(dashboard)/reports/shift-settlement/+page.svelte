<script lang="ts">
	import { onMount } from 'svelte';
	import { getShiftSettlement } from '$lib/api/reports';
	import { listUsers, type User } from '$lib/api/users';
	import ReportsNav from '$lib/components/reports/ReportsNav.svelte';
	import {
		CalendarDays,
		Users,
		Receipt,
		Wallet,
		Filter,
		RefreshCw,
		AlertTriangle,
		UserRound
	} from 'lucide-svelte';

	interface SettlementPayment {
		method: string;
		amount: number;
	}

	interface ShiftSettlementData {
		cashier_name: string;
		total_transactions: number;
		total_revenue: number;
		payment_methods: SettlementPayment[];
	}

	// ── Helper tanggal & format ──────────────────────────────
	function todayISO(): string {
		const d = new Date();
		return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
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
	let date = todayISO();
	let userId = '';
	let settlements: ShiftSettlementData[] = [];
	let cashiers: User[] = [];
	let loading = false;
	let error = '';

	async function loadCashiers(): Promise<void> {
		try {
			const res = await listUsers(0, 100, true);
			if (res.success) cashiers = res.data.items;
		} catch {
			// Dropdown tetap tersedia dengan opsi "Semua Kasir"
		}
	}

	async function fetchData(): Promise<void> {
		loading = true;
		error = '';
		try {
			const res = await getShiftSettlement(userId || null, date);
			if (res.success) {
				settlements = Array.isArray(res.data) ? res.data : [];
			} else {
				error = res.message || 'Gagal memuat laporan.';
			}
		} catch (e: any) {
			error = e?.message ?? 'Terjadi kesalahan saat memuat data.';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadCashiers();
		fetchData();
	});

	// ── Turunan ─────────────────────────────────────────────
	$: totalTransactions = settlements.reduce((sum, i) => sum + (i.total_transactions ?? 0), 0);
	$: totalRevenue = settlements.reduce((sum, i) => sum + (i.total_revenue ?? 0), 0);
</script>

<div class="space-y-6">
	<ReportsNav />

	<div>
		<h1 class="text-2xl font-bold text-gray-900">Shift Settlement</h1>
		<p class="text-sm text-gray-500 mt-1">Rekap penyelesaian shift per kasir pada tanggal tertentu.</p>
	</div>

	<!-- Filter Bar -->
	<div class="card">
		<div class="flex flex-wrap items-end gap-3">
			<div class="flex flex-col gap-1.5">
				<label for="date" class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</label>
				<input id="date" type="date" bind:value={date} class="input-field w-44" />
			</div>
			<div class="flex flex-col gap-1.5">
				<label for="cashier" class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kasir</label>
				<select id="cashier" bind:value={userId} class="input-field w-56">
					<option value="">Semua Kasir</option>
					{#each cashiers as cashier}
						<option value={cashier.id}>{cashier.name}{cashier.role ? ` — ${cashier.role}` : ''}</option>
					{/each}
				</select>
			</div>
			<button class="btn-primary inline-flex items-center gap-2" on:click={fetchData} disabled={loading}>
				<Filter class="w-4 h-4" /> Terapkan
			</button>
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
	{:else if settlements.length === 0}
		<div class="card py-12 text-center">
			<CalendarDays class="w-10 h-10 mx-auto text-gray-300" />
			<p class="text-sm text-gray-500 mt-3">Belum ada data settlement untuk tanggal dan kasir yang dipilih.</p>
		</div>
	{:else}
		<!-- Summary Chips -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<div class="card flex items-center gap-4">
				<div class="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-600">
					<Users class="w-6 h-6" />
				</div>
				<div>
					<p class="text-sm text-gray-500">Total Kasir</p>
					<p class="text-xl font-bold text-gray-900 mt-0.5 tabular-nums">{settlements.length}</p>
				</div>
			</div>
			<div class="card flex items-center gap-4">
				<div class="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 text-purple-600">
					<Receipt class="w-6 h-6" />
				</div>
				<div>
					<p class="text-sm text-gray-500">Total Transaksi</p>
					<p class="text-xl font-bold text-gray-900 mt-0.5 tabular-nums">{totalTransactions.toLocaleString('id-ID')}</p>
				</div>
			</div>
			<div class="card flex items-center gap-4">
				<div class="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600">
					<Wallet class="w-6 h-6" />
				</div>
				<div>
					<p class="text-sm text-gray-500">Total Pendapatan</p>
					<p class="text-xl font-bold text-gray-900 mt-0.5 tabular-nums">{formatCurrency(totalRevenue)}</p>
				</div>
			</div>
		</div>

		<!-- Settlement Table -->
		<div class="card overflow-hidden !p-0">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-gray-50 border-b border-gray-200">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kasir</th>
							<th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Transaksi</th>
							<th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Pendapatan</th>
							<th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rincian Pembayaran</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each settlements as item}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										<div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 shrink-0">
											<UserRound class="w-4 h-4" />
										</div>
										<span class="font-medium text-gray-900">{item.cashier_name}</span>
									</div>
								</td>
								<td class="px-6 py-4 text-right text-gray-700 tabular-nums">
									{Number(item.total_transactions ?? 0).toLocaleString('id-ID')}
								</td>
								<td class="px-6 py-4 text-right font-semibold text-gray-900 tabular-nums">
									{formatCurrency(item.total_revenue)}
								</td>
								<td class="px-6 py-4">
									{#if (item.payment_methods ?? []).length > 0}
										<div class="flex flex-wrap gap-1.5">
											{#each item.payment_methods ?? [] as pm}
												<span class="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
													<span class="font-semibold capitalize">{pm.method}</span>
													<span class="text-gray-500 tabular-nums">{formatCurrency(pm.amount)}</span>
												</span>
											{/each}
										</div>
									{:else}
										<span class="text-xs text-gray-400">—</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
					<tfoot class="bg-gray-50 border-t-2 border-gray-200">
						<tr>
							<th class="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wide">Grand Total</th>
							<th class="px-6 py-4 text-right text-sm font-bold text-gray-900 tabular-nums">
								{Number(totalTransactions).toLocaleString('id-ID')}
							</th>
							<th class="px-6 py-4 text-right text-sm font-bold text-gray-900 tabular-nums">
								{formatCurrency(totalRevenue)}
							</th>
							<th class="px-6 py-4"></th>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	{/if}
</div>

