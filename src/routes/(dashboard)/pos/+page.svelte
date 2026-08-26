<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		Plus,
		Minus,
		Trash2,
		ArrowRight,
		ShoppingCart,
		UtensilsCrossed,
		CheckCircle2,
		Loader2,
		Search,
		PackageX,
		Tag
	} from 'lucide-svelte';
	import { orderStore } from '$lib/stores/orders';
	import { listCategories, type CategoryResponse } from '$lib/api/categories.api';
	import { listMenuItems, type MenuItemResponse } from '$lib/api/menu-items.api';
	import { listTables, type Table } from '$lib/api/tables';
	import { getActiveTaxConfig, type TaxConfig } from '$lib/api/settings';

	interface CartLine {
		id: string;
		name: string;
		price: number;
		qty: number;
	}

	const orderTypes = [
		{ value: 'dine_in', label: 'Makan di Tempat' },
		{ value: 'takeaway', label: 'Bawa Pulang' },
		{ value: 'gofood', label: 'GoFood' },
		{ value: 'grabfood', label: 'GrabFood' }
	] as const;

	// ── Data dari API ──
	let categories: CategoryResponse[] = [];
	let menuItems: MenuItemResponse[] = [];
	let tables: Table[] = [];
	let taxConfig: TaxConfig | null = null;
	let selectedCategory = '';
	let searchTerm = '';
	let loadingMenu = true;

	// ── Form / Cart ──
	let cart: CartLine[] = [];
	let orderType: (typeof orderTypes)[number]['value'] = 'dine_in';
	let selectedTableId = '';
	let promoCode = '';
	let notes = '';
	let creating = false;
	let error = '';
	let successMessage = '';
	let createdOrderId = '';

	onMount(async () => {
		await Promise.all([loadCategories(), loadTables(), loadTaxConfig(), loadMenuItems()]);
	});

	async function loadTaxConfig(): Promise<void> {
		try {
			const res = await getActiveTaxConfig();
			if (res.success) taxConfig = res.data;
		} catch {
			/* non-fatal */
		}
	}

	async function loadCategories(): Promise<void> {
		try {
			const res = await listCategories(0, 100);
			if (res.success) categories = Array.isArray(res.data) ? res.data : [];
		} catch {
			/* non-fatal */
		}
	}

	async function loadTables(): Promise<void> {
		try {
			const res = await listTables('available', 0, 100);
			if (res.success) tables = Array.isArray(res.data) ? res.data : [];
		} catch {
			/* non-fatal */
		}
	}

	async function loadMenuItems(): Promise<void> {
		loadingMenu = true;
		try {
			const res = await listMenuItems(selectedCategory || undefined, 0, 100);
			if (res.success) menuItems = Array.isArray(res.data) ? res.data : [];
		} catch {
			menuItems = [];
		} finally {
			loadingMenu = false;
		}
	}

	function selectCategory(categoryId: string): void {
		selectedCategory = categoryId;
		loadMenuItems();
	}

	$: filteredItems = menuItems.filter(
		(item) =>
			item.is_available !== false &&
			(!searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	// ── Kalkulasi ──
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
		error = '';
		successMessage = '';
		createdOrderId = '';
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
		if (found) {
			found.qty += 1;
			cart = [...cart];
		}
	}

	function decrement(id: string): void {
		const found = cart.find((i) => i.id === id);
		if (!found) return;
		found.qty -= 1;
		if (found.qty <= 0) {
			cart = cart.filter((i) => i.id !== id);
		} else {
			cart = [...cart];
		}
	}

	function removeItem(id: string): void {
		cart = cart.filter((i) => i.id !== id);
	}

	async function handleCreateOrder(): Promise<void> {
		if (cart.length === 0) {
			error = 'Keranjang masih kosong. Tambahkan menu terlebih dahulu.';
			return;
		}
		if (orderType === 'dine_in' && !selectedTableId) {
			error = 'Pilih meja untuk order makan di tempat.';
			return;
		}
		creating = true;
		error = '';
		successMessage = '';
		try {
			const order = await orderStore.createOrder({
				order_type: orderType,
				table_id: orderType === 'dine_in' ? selectedTableId : null,
				items: cart.map((i) => ({ menu_item_id: i.id, quantity: i.qty })),
				notes: notes || null,
				promo_code: promoCode || null
			});
			createdOrderId = order.id;
			successMessage = `Order ${order.id.slice(0, 8)} berhasil dibuat dengan total ${formatCurrency(order.total_amount)}.`;
			cart = [];
			notes = '';
			promoCode = '';
		} catch (e: any) {
			error = e?.message ?? 'Gagal membuat order.';
		} finally {
			creating = false;
		}
	}

	function goToPayment(): void {
		if (createdOrderId) goto(`/pos/payment?order_id=${createdOrderId}`);
	}
</script>

<svelte:head>
	<title>POS — Buat Order — POS F&B</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<div class="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 text-primary-600">
			<UtensilsCrossed class="w-6 h-6" />
		</div>
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Buat Order Baru</h1>
			<p class="text-sm text-gray-500">Pilih menu, tentukan meja & tipe order</p>
		</div>
	</div>

	{#if error}
		<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
			{error}
		</div>
	{/if}
	{#if successMessage}
		<div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
			{successMessage}
		</div>
	{/if}

	<div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
		<!-- Kolom menu -->
		<div class="space-y-4 xl:col-span-2">
			<!-- Kategori -->
			<div class="flex flex-wrap gap-2">
				<button
					class="rounded-full border px-3.5 py-1.5 text-sm font-medium transition {selectedCategory === '' ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:text-primary-600'}"
					on:click={() => selectCategory('')}
				>
					Semua
				</button>
				{#each categories as category}
					<button
						class="rounded-full border px-3.5 py-1.5 text-sm font-medium transition {selectedCategory === category.id ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:text-primary-600'}"
						on:click={() => selectCategory(category.id)}
					>
						{category.name}
					</button>
				{/each}
			</div>

			<!-- Pencarian -->
			<div class="relative">
				<Search class="pointer-events-none absolute top-1/2 left-3.5 w-4 h-4 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					placeholder="Cari menu..."
					aria-label="Cari menu"
					bind:value={searchTerm}
					class="input-field pl-10"
				/>
			</div>

			<!-- Grid menu -->
			{#if loadingMenu}
				<div class="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-20 text-sm text-gray-500">
					<Loader2 class="w-5 h-5 animate-spin" /> Memuat menu...
				</div>
			{:else if filteredItems.length === 0}
				<div class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-center">
					<PackageX class="h-10 w-10 text-gray-300" />
					<p class="mt-3 text-sm font-medium text-gray-700">Menu tidak ditemukan</p>
				</div>
			{:else}
				<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
					{#each filteredItems as item (item.id)}
						<button
							class="card group flex flex-col items-start p-4 text-left transition hover:border-primary-300 hover:shadow-md"
							on:click={() => addToCart({ id: item.id, name: item.name, price: Number(item.base_price) })}
						>
							<div class="flex w-full items-start justify-between gap-2">
								<h3 class="font-semibold text-gray-900">{item.name}</h3>
								<span class="inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-full bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
									<Plus class="w-4 h-4" />
								</span>
							</div>
							<p class="mt-2 text-sm font-bold text-primary-600">{formatCurrency(Number(item.base_price))}</p>
						</button>
					{/each}
				</div>
			{/if}
		</div>
		<div class="xl:col-span-1">
			<div class="sticky top-6 space-y-4">
				<div class="card !p-5">
					<div class="mb-4 flex items-center justify-between">
						<h2 class="flex items-center gap-2 text-base font-bold text-gray-900">
							<ShoppingCart class="w-5 h-5 text-primary-600" /> Keranjang
						</h2>
						<span class="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">{cartCount} item</span>
					</div>

					{#if cart.length === 0}
						<p class="py-6 text-center text-sm text-gray-500">Keranjang kosong. Pilih menu untuk memulai.</p>
					{:else}
						<ul class="space-y-3">
							{#each cart as item (item.id)}
								<li class="flex items-center justify-between gap-2 rounded-lg border border-gray-100 p-2.5">
									<div class="min-w-0">
										<p class="truncate text-sm font-medium text-gray-900">{item.name}</p>
										<p class="text-xs text-gray-500">{formatCurrency(item.price)}</p>
									</div>
									<div class="flex shrink-0 items-center gap-1.5">
										<button class="flex items-center justify-center w-6 h-6 rounded-md border border-gray-200 bg-gray-50 text-gray-600 transition hover:bg-gray-100" on:click={() => decrement(item.id)} aria-label="Kurangi jumlah">
											<Minus class="w-3.5 h-3.5" />
										</button>
										<span class="w-6 text-center text-sm font-semibold text-gray-900">{item.qty}</span>
										<button class="flex items-center justify-center w-6 h-6 rounded-md border border-gray-200 bg-gray-50 text-gray-600 transition hover:bg-gray-100" on:click={() => increment(item.id)} aria-label="Tambah jumlah">
											<Plus class="w-3.5 h-3.5" />
										</button>
										<button class="flex items-center justify-center w-6 h-6 rounded-md border border-gray-200 text-red-500 transition hover:bg-red-50" on:click={() => removeItem(item.id)} aria-label="Hapus item">
											<Trash2 class="w-3.5 h-3.5" />
										</button>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
				<div class="card space-y-4 !p-5">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700" for="order-type">Tipe Order</label>
						<select id="order-type" class="input-field" bind:value={orderType}>
							{#each orderTypes as ot}
								<option value={ot.value}>{ot.label}</option>
							{/each}
						</select>
					</div>

					{#if orderType === 'dine_in'}
						<div>
							<label class="mb-1 block text-sm font-medium text-gray-700" for="order-table">Meja</label>
							<select id="order-table" class="input-field" bind:value={selectedTableId}>
								<option value="">Pilih meja...</option>
								{#each tables as table}
									<option value={table.id}>Meja {table.table_number}</option>
								{/each}
							</select>
						</div>
					{/if}

					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700" for="order-promo">Kode Promo</label>
						<div class="relative">
							<Tag class="pointer-events-none absolute top-1/2 left-3.5 w-4 h-4 -translate-y-1/2 text-gray-400" />
							<input
								id="order-promo"
								type="text"
								placeholder="Masukkan kode promo"
								bind:value={promoCode}
								class="input-field pl-10"
							/>
						</div>
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700" for="order-notes">Catatan</label>
						<textarea id="order-notes" rows="2" placeholder="Catatan untuk dapur / kurir" bind:value={notes} class="input-field"></textarea>
					</div>
				</div>

				<div class="card space-y-3 !p-5">
					<div class="flex items-center justify-between text-sm text-gray-600">
						<span>Subtotal</span>
						<span class="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
					</div>
					<div class="flex items-center justify-between text-sm text-gray-600">
						<span>Pajak {taxConfig ? `(${taxConfig.rate}%)` : ''}</span>
						<span class="font-medium text-gray-900">{formatCurrency(taxAmount)}</span>
					</div>
					<div class="flex items-center justify-between border-t border-gray-100 pt-3">
						<span class="text-base font-bold text-gray-900">Total</span>
						<span class="text-lg font-extrabold text-primary-600">{formatCurrency(total)}</span>
					</div>

					<button class="btn-primary w-full" on:click={handleCreateOrder} disabled={creating}>
						{#if creating}
							<Loader2 class="w-4 h-4 animate-spin" /> Membuat order...
						{:else}
							<CheckCircle2 class="w-4 h-4" /> Buat Order
						{/if}
					</button>

					{#if createdOrderId}
						<button class="btn-secondary w-full" on:click={goToPayment}>
							Lanjut ke Pembayaran <ArrowRight class="w-4 h-4" />
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>