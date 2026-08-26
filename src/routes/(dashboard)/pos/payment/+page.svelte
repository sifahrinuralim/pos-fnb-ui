<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import {
		Banknote,
		CreditCard,
		QrCode,
		CheckCircle2,
		AlertTriangle,
		ArrowLeft,
		Loader2,
		Wallet,
		Receipt,
		UtensilsCrossed,
		Calendar,
		Hash
	} from 'lucide-svelte';
	import { createPayment, type Payment } from '$lib/api/payments';
	import { orderStore } from '$lib/stores/orders';

	type PaymentMethod = 'cash' | 'qris' | 'card';

	const methods: { value: PaymentMethod; label: string; desc: string; icon: typeof Banknote }[] = [
		{ value: 'cash', label: 'Tunai', desc: 'Pembayaran uang tunai', icon: Banknote },
		{ value: 'qris', label: 'QRIS', desc: 'Pelanggan scan QRIS', icon: QrCode },
		{ value: 'card', label: 'Kartu', desc: 'Debit / kredit / e-wallet', icon: CreditCard }
	];

	const methodLabel: Record<PaymentMethod, string> = { cash: 'Tunai', qris: 'QRIS', card: 'Kartu' };

	let method: PaymentMethod = 'cash';
	let amountTouched = false;
	let amountInput = '0';
	let loading = false;
	let error = '';
	let paid: Payment | null = null;

	$: order = $orderStore.currentOrder;
	$: orderIdFromQuery = $page.url.searchParams.get('order_id') ?? '';
	$: orderId = orderIdFromQuery || order?.id || '';
	$: total = Number(order?.total_amount ?? 0);
	$: amount = amountTouched ? Math.max(0, Number(amountInput) || 0) : total;
	$: change = method === 'cash' ? amount - total : 0;
	$: canSubmit = !loading && !paid && !!order && amount >= total && amount > 0;

	onMount(() => {
		// Dukung navigasi langsung: /pos/payment?order_id=...
		if (orderId && (!order || order.id !== orderId)) {
			orderStore.getOrder(orderId);
		}
	});

	$: if (order) {
		if (!amountTouched) amountInput = String(order.total_amount);
	}

	function selectMethod(value: PaymentMethod): void {
		if (paid) return;
		method = value;
		if (value !== 'cash') {
			amountTouched = false; // qris/card → nominal wajib = total
		}
		error = '';
	}

	function handleInputAmount(event: Event): void {
		const raw = (event.currentTarget as HTMLInputElement).value;
		// Simpan angka mentah agar koma/format tetap bisa diketik
		amountInput = raw;
		if (raw === '') return;
		amountTouched = true;
	}
	function pseudoQR(seed: string, size = 21): boolean[][] {
		let h = 2166136261;
		for (let i = 0; i < seed.length; i++) {
			h ^= seed.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		const rand = () => {
			h ^= h << 13;
			h ^= h >>> 17;
			h ^= h << 5;
			return ((h >>> 0) % 100) / 100;
		};
		const grid: boolean[][] = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				grid[y][x] = rand() > 0.48;
			}
		}
		const finder = (ox: number, oy: number) => {
			for (let y = 0; y < 7; y++) {
				for (let x = 0; x < 7; x++) {
					const on =
						x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4);
					grid[oy + y][ox + x] = on;
				}
			}
		};
		finder(0, 0);
		finder(size - 7, 0);
		finder(0, size - 7);
		return grid;
	}

	$: qrModules = order ? pseudoQR(order.id) : [];
	$: qrCodeUrl = paid?.reference_id
		? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(paid.reference_id)}`
		: null;

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(Number(value) || 0);
	}

	function formatDate(value: string): string {
		return new Date(value).toLocaleString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function handleProcessPayment(): Promise<void> {
		if (!order) return;
		if (amount < total) {
			error = `Nominal kurang dari total tagihan (${formatCurrency(total)}).`;
			return;
		}
		loading = true;
		error = '';
		try {
			const res = await createPayment({
				order_id: order.id,
				amount,
				method
			});
			if (!res.success) throw res;

			paid = (res.data ?? { order_id: order.id, amount, method, status: 'completed' }) as Payment;

			// Integrasi: setelah pembayaran sukses, status order menjadi served (selesai)
			try {
				await orderStore.updateStatus(order.id, 'served');
			} catch (statusErr: any) {
				// Pembayaran sudah sukses; gagal update status tidak menggagalkan alur
				console.error('Gagal update status order:', statusErr);
			}
		} catch (e: any) {
			error = e?.message ?? 'Pembayaran gagal. Silakan coba lagi.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Pembayaran — POS F&B</title>
</svelte:head>

<div class="mx-auto max-w-5xl">
	<!-- Header -->
	<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<button
				class="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
				aria-label="Kembali ke kasir"
				on:click={() => goto('/pos')}
			>
				<ArrowLeft class="w-5 h-5" />
			</button>
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Pembayaran</h1>
				<p class="text-sm text-gray-500">Selesaikan transaksi order aktif</p>
			</div>
		</div>
	</div>

	{#if paid && order}
		<!-- ── Sukses ── -->
		<div class="card py-12 text-center">
			<div class="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
				<CheckCircle2 class="w-8 h-8 text-green-600" />
			</div>
			<h2 class="mt-4 text-xl font-bold text-gray-900">Pembayaran Berhasil</h2>
			<p class="mt-1 text-sm text-gray-500">
				Order <span class="font-semibold text-gray-700">#{order.id}</span> lunas via {methodLabel[paid.method]}{' '}
				dan berstatus <span class="font-semibold text-green-600">completed</span>.
			</p>

			<div class="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-3 text-left sm:grid-cols-4">
				<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
					<p class="text-xs text-gray-500">Jumlah</p>
					<p class="mt-0.5 text-sm font-bold text-gray-900">{formatCurrency(paid.amount ?? amount)}</p>
				</div>
				<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
					<p class="text-xs text-gray-500">Metode</p>
					<p class="mt-0.5 text-sm font-bold capitalize text-gray-900">{methodLabel[paid.method]}</p>
				</div>
				<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
					<p class="text-xs text-gray-500">Status</p>
					<p class="mt-0.5 text-sm font-bold text-green-600">Lunas</p>
				</div>
				<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
					<p class="text-xs text-gray-500">Referensi</p>
					<p class="mt-0.5 text-sm font-bold text-gray-900">{paid.reference_id ?? '—'}</p>
				</div>
			</div>

			<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
				<button class="btn-secondary" on:click={() => goto('/orders')}>
					<Receipt class="w-4 h-4" /> Ke Pesanan
				</button>
				<button class="btn-primary" on:click={() => goto('/payments')}>
					<Wallet class="w-4 h-4" /> Lihat Pembayaran
				</button>
			</div>
		</div>
	{:else if order}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
			<!-- ── Ringkasan Order ── -->
			<div class="lg:col-span-2">
				<div class="card sticky top-24">
					<div class="mb-4 flex items-center gap-3">
						<div class="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-600">
							<Receipt class="w-5 h-5" />
						</div>
						<div>
							<h2 class="text-base font-semibold text-gray-900">Ringkasan Order</h2>
							<p class="text-xs text-gray-500">#{order.id}</p>
						</div>
					</div>

					<div class="space-y-2.5 text-sm">
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-1.5 text-gray-500">
								<Hash class="w-4 h-4" /> Order ID
							</span>
							<span class="font-mono text-xs text-gray-700">{order.id}</span>
						</div>
						{#if order.table_number}
							<div class="flex items-center justify-between">
								<span class="flex items-center gap-1.5 text-gray-500">
									<UtensilsCrossed class="w-4 h-4" /> Meja
								</span>
								<span class="font-medium text-gray-700">Meja {order.table_number}</span>
							</div>
						{/if}
						<div class="flex items-center justify-between">
							<span class="flex items-center gap-1.5 text-gray-500">
								<Calendar class="w-4 h-4" /> Waktu
							</span>
							<span class="text-xs text-gray-700">{formatDate(order.created_at ?? new Date().toISOString())}</span>
						</div>
					</div>

					{#if order.items && order.items.length > 0}
						<div class="mt-5 border-t border-gray-100 pt-4">
							<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Item</p>
							<ul class="space-y-2">
								{#each order.items as item}
									<li class="flex items-center justify-between gap-2 text-sm">
										<span class="text-gray-700">
											{item.menu_item_name}
											<span class="text-gray-400"> × {item.quantity}</span>
										</span>
										<span class="font-medium text-gray-900">
											{formatCurrency(Number(item.unit_price) * Number(item.quantity))}
										</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<div class="mt-5 border-t border-gray-100 pt-4">
						<div class="flex items-center justify-between">
							<span class="text-sm text-gray-500">Total Tagihan</span>
							<span class="text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- ── Form Pembayaran ── -->
			<div class="lg:col-span-3">
				<div class="card">
					<div class="mb-5 flex items-center gap-3">
						<div class="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600">
							<Wallet class="w-5 h-5" />
						</div>
						<div>
							<h2 class="text-base font-semibold text-gray-900">Metode & Nominal</h2>
							<p class="text-xs text-gray-500">Pilih metode pembayaran lalu proses transaksi</p>
						</div>
					</div>

					<!-- Pilih metode -->
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
						{#each methods as m}
							<button
								type="button"
								on:click={() => selectMethod(m.value)}
								class="relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition
									{method === m.value
										? 'border-primary-600 bg-primary-50 shadow-sm'
										: 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}"
							>
								{#if method === m.value}
									<span class="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full bg-primary-600">
										<CheckCircle2 class="w-3.5 h-3.5 text-white" />
									</span>
								{/if}
								<svelte:component
									this={m.icon}
									class="w-6 h-6 {method === m.value ? 'text-primary-600' : 'text-gray-400'}"
								/>
								<span class="font-semibold text-gray-900">{m.label}</span>
								<span class="text-xs text-gray-500">{m.desc}</span>
							</button>
						{/each}
					</div>

					<!-- QRIS -->
					{#if method === 'qris'}
						<div class="mt-5 rounded-xl border border-dashed border-sky-300 bg-sky-50/60 p-5">
							<p class="mb-3 flex items-center gap-2 text-sm font-medium text-sky-800">
								<QrCode class="w-4 h-4" /> Minta pelanggan memindai QRIS berikut
							</p>
							<div class="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
								{#if qrCodeUrl}
									<img src={qrCodeUrl} alt="QRIS" class="h-52 w-52 rounded-lg bg-white p-2 ring-1 ring-gray-200" />
								{:else}
									<div
										class="grid h-52 w-52 gap-px rounded-lg bg-white p-3 ring-1 ring-gray-200"
										style="grid-template-columns: repeat(21, minmax(0,1fr));"
									>
										{#each qrModules as row}
											{#each row as cell}
												<span class={cell ? 'bg-gray-900' : 'bg-white'}></span>
											{/each}
										{/each}
									</div>
								{/if}
								<div class="space-y-1.5 text-sm">
									<p class="text-sky-900">Total yang harus dibayar:</p>
									<p class="text-2xl font-bold text-sky-900">{formatCurrency(total)}</p>
									<p class="max-w-xs text-xs text-sky-700">
										Setelah pelanggan melakukan scan & pembayaran, klik tombol proses di bawah.
									</p>
								</div>
							</div>
						</div>
					{/if}

					<!-- Input nominal -->
					<div class="mt-5">
						<label for="payment-amount" class="mb-1.5 block text-sm font-medium text-gray-700">
							Nominal Pembayaran
						</label>
						{#if method === 'cash'}
							<div class="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
								<span class="text-sm font-semibold text-gray-400">Rp</span>
								<input
									id="payment-amount"
									type="text"
									inputmode="numeric"
									value={amountInput}
									on:input={handleInputAmount}
									placeholder="0"
									class="w-full bg-transparent text-2xl font-bold text-gray-900 outline-none placeholder:text-gray-300"
								/>
							</div>
						{:else}
							<div class="flex items-center justify-between rounded-xl bg-gray-100 px-4 py-3">
								<span class="text-sm text-gray-500">Total tagihan (tidak dapat diubah)</span>
								<span class="text-xl font-bold text-gray-900">{formatCurrency(total)}</span>
							</div>
						{/if}

						<div class="mt-3 grid grid-cols-2 gap-3">
							<div class="rounded-xl border border-gray-200 bg-gray-50 p-3">
								<p class="text-xs text-gray-500">Total Tagihan</p>
								<p class="text-lg font-bold text-gray-900">{formatCurrency(total)}</p>
							</div>
							<div class="rounded-xl border border-gray-200 bg-gray-50 p-3">
								<p class="text-xs text-gray-500">{method === 'cash' ? 'Kembalian' : 'Dibayar'}</p>
								<p class="text-lg font-bold {change >= 0 ? 'text-emerald-600' : 'text-red-600'}">
									{formatCurrency(Math.max(0, change))}
								</p>
							</div>
						</div>
					</div>

					<!-- Error -->
					{#if error}
						<div class="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
							<AlertTriangle class="mt-0.5 w-5 h-5 shrink-0 text-red-600" />
							<p class="text-sm text-red-700">{error}</p>
						</div>
					{/if}

					<!-- Tombol proses -->
					<button
						type="button"
						on:click={handleProcessPayment}
						disabled={!canSubmit}
						class="btn-primary mt-5 flex w-full items-center justify-center gap-2 text-base py-3.5"
					>
						{#if loading}
							<Loader2 class="w-5 h-5 animate-spin" />
							Memproses...
						{:else}
							<Wallet class="w-5 h-5" />
							Proses Pembayaran
						{/if}
					</button>
					{#if method === 'cash' && change < 0}
						<p class="mt-2 text-center text-xs text-red-500">
							Nominal yang dimasukkan kurang dari total tagihan.
						</p>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<!-- ── Tidak ada order ── -->
		<div class="card py-16 text-center">
			<div class="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
				<Receipt class="w-8 h-8 text-gray-400" />
			</div>
			<h2 class="mt-4 text-lg font-bold text-gray-900">Tidak ada order aktif</h2>
			<p class="mt-1 text-sm text-gray-500">
				Buat pesanan terlebih dahulu di halaman kasir untuk melanjutkan pembayaran.
			</p>
			<button class="btn-primary mt-6" on:click={() => goto('/pos')}>
				<UtensilsCrossed class="w-4 h-4" /> Buka Kasir
			</button>
		</div>
	{/if}
</div>
