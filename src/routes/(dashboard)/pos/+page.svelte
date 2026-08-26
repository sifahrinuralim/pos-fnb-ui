<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Plus, Minus, Trash2, ArrowRight, ShoppingCart, UtensilsCrossed, CheckCircle2, Loader2 } from 'lucide-svelte';
	import { orderStore } from '$lib/stores/orders';
	import { getActiveTaxConfig, type TaxConfig } from '$lib/api/settings';
	import type { Order } from '$lib/api/orders';

	interface CartLine {
		id: string;
		name: string;
		price: number;
		qty: number;
	}

	// Mock menu — dalam implementasi penuh data berasal dari API menu-items
	const menu: { id: string; name: string; price: number }[] = [
		{ id: '1', name: 'Nasi Goreng', price: 25000 },
		{ id: '2', name: 'Es Teh', price: 5000 },
		{ id: '3', name: 'Mie Goreng', price: 23000 },
		{ id: '4', name: 'Es Jeruk', price: 8000 }
	];

	let cart: CartLine[] = [];
	let selectedTable = '';
	let orderType = 'dine_in';
	let taxConfig: TaxConfig | null = null;
	let creating = false;
	let createdOrder: Order | null = null;
	let error = '';

	const orderTypes = [
		{ value: 'dine_in', label: 'Makan di Tempat' },
		{ value: 'takeaway', label: 'Bawa Pulang' },
		{ value: 'gofood', label: 'GoFood' },
		{ value: 'grabfood', label: 'GrabFood' }
	];

	onMount(async () => {
		const res = await getActiveTaxConfig();
		if (res.success) taxConfig = res.data;
	});

	$: subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
	$: taxAmount = taxConfig ? subtotal * (taxConfig.rate / 100) : 0;
	$: total = subtotal + taxAmount;
	$: cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(Number(value) || 0);
	}

	function addToCart(item: { id: string; name: string; price: number }): void {
		createdOrder = null;
		error = '';
		const existing = cart.find((i) => i.id === item.id);
		if (existing) {
			existing.qty += 1;
			cart = [...cart];
		} else {
			cart = [...cart, { ...item, qty: 1 }];
		}
	}

	function increment(id: string): void {
		const found = cart.find((i) => i.id === id);
		if (found) addToCart({ id: found.id, name: found.name, price: found.price });
	}

	function decrement(id: string): void {
		error = '';
		const existing = cart.find((i) => i.id === id);
		if (!existing) return;
		existing.qty -= 1;
		if (existing.qty <= 0) {
			cart = cart.filter((i) => i.id !== id);
		} else {
			cart = [...cart];
		}
	}

	async function handleCreateOrder(): Promise<void> {
		if (cart.length === 0) {
			error = 'Keranjang masih kosong. Tambahkan menu terlebih dahulu.';
			return;
		}
		if (orderType === 'dine_in' && !selectedTable) {
			error = 'Pilih meja untuk order makan di tempat.';
			return;
		}
		creating = true;
		error = '';
		try {
			const order = await orderStore.createOrder({
				items: cart.map((i) => ({ menu_id: i.id, quantity: i.qty, price: i.price })),
				table_number: orderType === 'dine_in' ? parseInt(selectedTable) : null,
				order_type: orderType
			});
			createdOrder = order;
			cart = [];
			selectedTable = '';
		} catch (e: any) {
			error = e?.message ?? 'Gagal membuat order.';
		} finally {
			creating = false;
		}
	}

	function goToPayment(): void {
		if (createdOrder) {
			goto(`/pos/payment?order_id=${createdOrder.id}`);
		}
	}
</script>

<svelte:head>
	<title>Kasir (POS) — POS F&B</title>
</svelte:head>

<div class="flex h-[calc(100vh-6.5rem)] flex-col gap-4 lg:flex-row">
	<!-- ── Menu ── -->
	<div class="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
		<div class="mb-4 flex items-center gap-3">
			<div class="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 text-primary-600">
				<UtensilsCrossed class="w-5 h-5" />
			</div>
			<div>
				<h2 class="text-lg font-bold text-gray-900">Menu</h2>
				<p class="text-xs text-gray-500">Klik menu untuk menambahkan ke order</p>
			</div>
		</div>

		{#if createdOrder}
			<div class="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
				<div class="flex items-center gap-2 text-sm font-medium text-green-800">
					<CheckCircle2 class="w-5 h-5 text-green-600" />
					Order #{createdOrder.id} berhasil dibuat
				</div>
				<button class="btn-primary !py-2 text-sm" on:click={goToPayment}>
					Lanjut ke Pembayaran <ArrowRight class="w-4 h-4" />
				</button>
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
			{#each menu as item}
				<button
					on:click={() => addToCart(item)}
					class="group flex flex-col items-start rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-primary-300 hover:bg-primary-50/50 hover:shadow-sm"
				>
					<span class="text-sm font-bold text-gray-900 group-hover:text-primary-700">{item.name}</span>
					<span class="mt-1 text-sm font-semibold text-primary-600">{formatCurrency(item.price)}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- ── Cart / Order ── -->
	<div class="flex w-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm lg:w-96">
		<div class="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
			<div class="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600">
				<ShoppingCart class="w-5 h-5" />
			</div>
			<div>
				<h2 class="text-base font-bold text-gray-900">Order Aktif</h2>
				<p class="text-xs text-gray-500">{cartCount} item</p>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto px-5 py-4">
			{#if cart.length === 0}
				<div class="flex h-full flex-col items-center justify-center py-10 text-center">
					<ShoppingCart class="h-10 w-10 text-gray-300" />
					<p class="mt-3 text-sm text-gray-500">Keranjang kosong.<br />Klik menu di sebelah kiri untuk menambah item.</p>
				</div>
			{:else}
				<ul class="space-y-3">
					{#each cart as item}
						<li class="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2.5">
							<div class="min-w-0">
								<p class="truncate text-sm font-medium text-gray-800">{item.name}</p>
								<p class="text-xs text-gray-500">{formatCurrency(item.price)}</p>
							</div>
							<div class="flex shrink-0 items-center gap-1.5">
								<button
									on:click={() => decrement(item.id)}
									class="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100"
									aria-label="Kurangi {item.name}"
								>
									<Minus class="w-3.5 h-3.5" />
								</button>
								<span class="w-6 text-center text-sm font-bold text-gray-900">{item.qty}</span>
								<button
									on:click={() => increment(item.id)}
									class="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100"
									aria-label="Tambah {item.name}"
								>
									<Plus class="w-3.5 h-3.5" />
								</button>
								<button
									on:click={() => (cart = cart.filter((i) => i.id !== item.id))}
									class="flex items-center justify-center w-7 h-7 rounded-md text-red-500 transition hover:bg-red-50"
									aria-label="Hapus {item.name}"
								>
									<Trash2 class="w-3.5 h-3.5" />
								</button>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div class="border-t border-gray-100 px-5 py-4">
			{#if error}
				<p class="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
			{/if}

			<div class="space-y-2 text-sm">
				<div class="flex items-center justify-between text-gray-600">
					<span>Subtotal</span>
					<span>{formatCurrency(subtotal)}</span>
				</div>
				{#if taxConfig}
					<div class="flex items-center justify-between text-gray-600">
						<span>{taxConfig.name} ({taxConfig.rate}%)</span>
						<span>{formatCurrency(taxAmount)}</span>
					</div>
				{/if}
				<div class="flex items-center justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
					<span>Total</span>
					<span>{formatCurrency(total)}</span>
				</div>
			</div>

			<div class="mt-4 space-y-2">
				<select bind:value={orderType} class="input-field" aria-label="Tipe order">
					{#each orderTypes as ot}
						<option value={ot.value}>{ot.label}</option>
					{/each}
				</select>
				{#if orderType === 'dine_in'}
					<select bind:value={selectedTable} class="input-field" aria-label="Pilih meja">
						<option value="">Pilih Meja...</option>
						{#each [1, 2, 3, 4, 5, 6, 7, 8] as t}
							<option value={t}>Meja {t}</option>
						{/each}
					</select>
				{/if}
				<button
					on:click={handleCreateOrder}
					disabled={creating}
					class="btn-primary flex w-full items-center justify-center gap-2"
				>
					{#if creating}
						<Loader2 class="w-4 h-4 animate-spin" /> Membuat Order...
					{:else}
						Buat Order
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>

