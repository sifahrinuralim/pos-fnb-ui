<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { Plus, Trash2, GripVertical } from 'lucide-svelte';
	import { listCategories } from '$lib/api/categories.api';
	import type { CategoryResponse } from '$lib/api/categories.api';
	import type { MenuItemResponse } from '$lib/api/menu-items.api';

	export let open = false;
	export let menuItem: MenuItemResponse | null = null;

	const dispatch = createEventDispatcher<{
		close: void;
		submit: {
			payload: {
				category_id: string;
				name: string;
				description: string | null;
				base_price: number;
				image_url: string | null;
				is_available: boolean;
				is_active: boolean;
				variants: Array<{ name: string; price_adjustment: string; is_active: boolean }> | null;
				addons: Array<{ addon_id: string; is_required: boolean }> | null;
			};
			isEdit: boolean;
			id?: string;
		};
	}>();

	let category_id = '';
	let name = '';
	let description = '';
	let base_price = '';
	let image_url = '';
	let is_available = true;
	let is_active = true;
	let variants: Array<{ id?: string; name: string; price_adjustment: string; is_active: boolean }> = [];
	let addonEntries: Array<{ addon_id: string; is_required: boolean }> = [];

	let categories: CategoryResponse[] = [];
	let errors: Record<string, string[]> = {};
	let submitting = false;

	$: isEdit = !!menuItem;
	$: mode = isEdit ? 'edit' : 'create';

	$: if (open) {
		if (menuItem) {
			category_id = menuItem.category_id;
			name = menuItem.name;
			description = menuItem.description ?? '';
			base_price = menuItem.base_price;
			image_url = menuItem.image_url ?? '';
			is_available = menuItem.is_available;
			is_active = menuItem.is_active;
			variants = (menuItem.variants ?? []).map((v) => ({
				id: v.id, name: v.name, price_adjustment: v.price_adjustment, is_active: v.is_active
			}));
			addonEntries = (menuItem.addons ?? []).map((a) => ({
				addon_id: a.addon.id, is_required: a.is_required
			}));
		} else {
			category_id = ''; name = ''; description = ''; base_price = '';
			image_url = ''; is_available = true; is_active = true;
			variants = []; addonEntries = [];
		}
		errors = {};
		submitting = false;
		loadCategories();
	}

	async function loadCategories(): Promise<void> {
		try {
			const res = await listCategories(0, 200);
			if (res.success && Array.isArray(res.data)) categories = res.data;
		} catch { /* silent */ }
	}

	function handleClose(): void { dispatch('close'); }

	function addVariant(): void {
		variants = [...variants, { name: '', price_adjustment: '0', is_active: true }];
	}
	function removeVariant(i: number): void { variants = variants.filter((_, idx) => idx !== i); }

	function addAddon(): void {
		addonEntries = [...addonEntries, { addon_id: '', is_required: false }];
	}
	function removeAddon(i: number): void { addonEntries = addonEntries.filter((_, idx) => idx !== i); }

	function validate(): boolean {
		const e: Record<string, string[]> = {};
		if (!category_id) e.category_id = ['Kategori wajib dipilih.'];
		if (!name.trim()) e.name = ['Nama menu wajib diisi.'];
		else if (name.trim().length > 200) e.name = ['Nama menu maksimal 200 karakter.'];
		if (!base_price || Number(base_price) <= 0) e.base_price = ['Harga wajib diisi dan lebih dari 0.'];
		variants.forEach((v, i) => {
			if (!v.name.trim()) e[`variant_${i}_name`] = [`Nama varian #${i + 1} wajib diisi.`];
		});
		errors = e;
		return Object.keys(e).length === 0;
	}

	function handleSubmit(ev: Event): void {
		ev.preventDefault();
		if (!validate()) return;
		submitting = true;
		dispatch('submit', {
			payload: {
				category_id, name: name.trim(),
				description: description.trim() || null,
				base_price: Number(base_price),
				image_url: image_url.trim() || null,
				is_available, is_active,
				variants: variants.length > 0
					? variants.map((v) => ({ name: v.name.trim(), price_adjustment: v.price_adjustment, is_active: v.is_active }))
					: null,
				addons: addonEntries.length > 0
					? addonEntries.filter((a) => a.addon_id).map((a) => ({ addon_id: a.addon_id, is_required: a.is_required }))
					: null
			},
			isEdit,
			id: menuItem?.id
		});
	}

	export function setServerErrors(serverErrors: Record<string, string[]>): void {
		errors = serverErrors;
		submitting = false;
	}
</script>

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div role="presentation" class="fixed inset-0 z-40 bg-black/50 transition-opacity" on:click={handleClose} />

	<div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
		<div class="w-full max-w-2xl max-h-[90vh] rounded-xl bg-white shadow-2xl flex flex-col">
			<!-- Header -->
			<div class="flex items-center justify-between border-b px-6 py-4 shrink-0">
				<h2 class="text-lg font-semibold text-gray-900">
					{mode === 'create' ? 'Tambah Menu Item' : 'Edit Menu Item'}
				</h2>
				<button type="button" class="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600" on:click={handleClose} aria-label="Tutup">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Form -->
			<form on:submit|preventDefault={handleSubmit} class="overflow-y-auto flex-1 p-6 space-y-5">
				<!-- BASIC INFO -->
				<div>
					<h3 class="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Informasi Dasar</h3>
					<div class="space-y-4">
						<div>
							<label for="mi-category" class="mb-1.5 block text-sm font-medium text-gray-700">
								Kategori <span class="text-red-500">*</span>
							</label>
							<select id="mi-category" bind:value={category_id}
								class="w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
								class:border-red-400={!!errors.category_id} class:border-gray-300={!errors.category_id}>
								<option value="">— Pilih Kategori —</option>
								{#each categories as cat (cat.id)}
									<option value={cat.id}>{cat.name}</option>
								{/each}
							</select>
							{#if errors.category_id}<p class="mt-1.5 text-xs text-red-600">{errors.category_id[0]}</p>{/if}
						</div>
						<div>
							<label for="mi-name" class="mb-1.5 block text-sm font-medium text-gray-700">
								Nama Menu <span class="text-red-500">*</span>
							</label>
							<input id="mi-name" type="text" bind:value={name} placeholder="Contoh: Nasi Goreng Spesial" maxlength="200"
								class="w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
								class:border-red-400={!!errors.name} class:ring-1={!!errors.name} class:ring-red-300={!!errors.name} class:border-gray-300={!errors.name} />
							{#if errors.name}<p class="mt-1.5 text-xs text-red-600">{errors.name[0]}</p>{/if}
							<p class="mt-1 text-right text-xs text-gray-400">{name.length}/200</p>
						</div>
						<div>
							<label for="mi-desc" class="mb-1.5 block text-sm font-medium text-gray-700">Deskripsi</label>
							<textarea id="mi-desc" bind:value={description} rows="3" placeholder="Opsional" maxlength="1000"
								class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
							<p class="mt-1 text-right text-xs text-gray-400">{description.length}/1000</p>
						</div>
						<div>
							<label for="mi-price" class="mb-1.5 block text-sm font-medium text-gray-700">
								Harga Dasar <span class="text-red-500">*</span>
							</label>
							<div class="relative">
								<span class="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-500">Rp</span>
								<input id="mi-price" type="number" min="0" step="100" bind:value={base_price} placeholder="0"
									class="w-full rounded-lg border py-2 pl-10 pr-3 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
									class:border-red-400={!!errors.base_price} class:ring-1={!!errors.base_price} class:ring-red-300={!!errors.base_price} class:border-gray-300={!errors.base_price} />
							</div>
							{#if errors.base_price}<p class="mt-1.5 text-xs text-red-600">{errors.base_price[0]}</p>{/if}
						</div>
						<div>
							<label for="mi-image" class="mb-1.5 block text-sm font-medium text-gray-700">URL Gambar</label>
							<input id="mi-image" type="url" bind:value={image_url} placeholder="https://example.com/image.jpg" maxlength="500"
								class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
						</div>
					</div>
				</div>

				<!-- STATUS TOGGLES -->
				<div>
					<h3 class="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</h3>
					<div class="space-y-3">
						<div class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
							<div>
								<p class="text-sm font-medium text-gray-700">Tersedia</p>
								<p class="text-xs text-gray-500">Dapat dipesan pelanggan</p>
							</div>
							<button type="button" on:click={() => (is_available = !is_available)}
								class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								class:bg-blue-600={is_available} class:bg-gray-300={!is_available}
								role="switch" aria-checked={is_available}>
								<span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
									class:translate-x-5={is_available} class:translate-x-0={!is_available} />
							</button>
						</div>
						<div class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
							<div>
								<p class="text-sm font-medium text-gray-700">Aktif</p>
								<p class="text-xs text-gray-500">Tampil di daftar menu</p>
							</div>
							<button type="button" on:click={() => (is_active = !is_active)}
								class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								class:bg-blue-600={is_active} class:bg-gray-300={!is_active}
								role="switch" aria-checked={is_active}>
								<span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200"
									class:translate-x-5={is_active} class:translate-x-0={!is_active} />
							</button>
						</div>
					</div>
				</div>

				<!-- VARIANTS -->
				<div>
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Varian</h3>
						<button type="button" on:click={addVariant}
							class="inline-flex items-center gap-1 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-400 hover:text-blue-600">
							<Plus class="h-3.5 w-3.5" /> Tambah Varian
						</button>
					</div>
					{#if variants.length === 0}
						<p class="text-sm text-gray-400 italic">Belum ada varian.</p>
					{:else}
						<div class="space-y-3">
							{#each variants as variant, idx (idx)}
								<div class="rounded-lg border border-gray-200 p-3">
									<div class="flex items-start gap-3">
										<GripVertical class="mt-2 h-4 w-4 shrink-0 text-gray-300" />
										<div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
											<div>
												<label for="var-name-{idx}" class="mb-1 block text-xs font-medium text-gray-600">Nama <span class="text-red-500">*</span></label>
												<input id="var-name-{idx}" type="text" bind:value={variant.name} placeholder="Large, Extra Pedas"
													class="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
													class:border-red-400={!!errors[`variant_${idx}_name`]} />
												{#if errors[`variant_${idx}_name`]}
													<p class="mt-1 text-xs text-red-600">{errors[`variant_${idx}_name`][0]}</p>
												{/if}
											</div>
											<div>
												<label for="var-price-{idx}" class="mb-1 block text-xs font-medium text-gray-600">Selisih Harga</label>
												<input id="var-price-{idx}" type="number" step="100" bind:value={variant.price_adjustment} placeholder="0"
													class="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
											</div>
										</div>
										<div class="flex flex-col items-center gap-2 pt-5">
											<button type="button" on:click={() => (variant.is_active = !variant.is_active)}
												class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
												class:bg-blue-600={variant.is_active} class:bg-gray-300={!variant.is_active}
												role="switch" aria-checked={variant.is_active}>
												<span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200"
													class:translate-x-4={variant.is_active} class:translate-x-0={!variant.is_active} />
											</button>
											<button type="button" on:click={() => removeVariant(idx)} class="text-gray-400 hover:text-red-500 transition" aria-label="Hapus">
												<Trash2 class="h-4 w-4" />
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- ADDONS -->
				<div>
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Addon</h3>
						<button type="button" on:click={addAddon}
							class="inline-flex items-center gap-1 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-400 hover:text-blue-600">
							<Plus class="h-3.5 w-3.5" /> Tambah Addon
						</button>
					</div>
					{#if addonEntries.length === 0}
						<p class="text-sm text-gray-400 italic">Belum ada addon.</p>
					{:else}
						<div class="space-y-3">
							{#each addonEntries as addon, idx (idx)}
								<div class="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
									<div class="flex-1">
										<input type="text" bind:value={addon.addon_id} placeholder="Addon ID (UUID)"
											class="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm shadow-sm transition placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
									</div>
									<div class="flex items-center gap-2 shrink-0">
										<span class="text-xs text-gray-500">Wajib</span>
										<button type="button" on:click={() => (addon.is_required = !addon.is_required)}
											class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
											class:bg-blue-600={addon.is_required} class:bg-gray-300={!addon.is_required}
											role="switch" aria-checked={addon.is_required}>
											<span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200"
												class:translate-x-4={addon.is_required} class:translate-x-0={!addon.is_required} />
										</button>
									</div>
									<button type="button" on:click={() => removeAddon(idx)} class="text-gray-400 hover:text-red-500 transition shrink-0" aria-label="Hapus">
										<Trash2 class="h-4 w-4" />
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- ERROR GENERAL -->
				{#if errors._general}
					<div class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errors._general[0]}</div>
				{/if}

				<!-- ACTIONS -->
				<div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
					<button type="button" on:click={handleClose}
						class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
						disabled={submitting}>Batal</button>
					<button type="submit"
						class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
						disabled={submitting}>
						{#if submitting}
							<svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Menyimpan...
						{:else}
							{mode === 'create' ? 'Tambah' : 'Simpan'}
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}



