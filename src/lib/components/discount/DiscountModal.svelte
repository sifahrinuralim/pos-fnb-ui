<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { X } from 'lucide-svelte';
	import type { DiscountResponse, DiscountCreate } from '$lib/api/discounts';
	import { categoriesStore } from '$lib/stores/categories';
	import { menuItemsStore } from '$lib/stores/menu-items';

	export let open = false;
	export let discount: DiscountResponse | null = null;
	const dispatch = createEventDispatcher();

	let formData: DiscountCreate = {
		name: '', code: '', discount_type: 'percentage', value: '',
		min_order_amount: null, max_discount_amount: null, applies_to: 'order',
		start_date: '', end_date: '', usage_limit: null, is_active: true, targets: []
	};
	let targetType = 'category';
	let targetId = '';

	onMount(async () => {
		await categoriesStore.loadCategories();
		await menuItemsStore.loadMenuItems();
	});

	$: if (open) {
		if (discount) {
			formData = {
				name: discount.name, code: discount.code, discount_type: discount.discount_type,
				value: discount.value, min_order_amount: discount.min_order_amount ?? null,
				max_discount_amount: discount.max_discount_amount ?? null, applies_to: discount.applies_to,
				start_date: discount.start_date?.substring(0, 10) ?? '',
				end_date: discount.end_date?.substring(0, 10) ?? '',
				usage_limit: discount.usage_limit ?? null, is_active: discount.is_active,
				targets: discount.targets ? [...discount.targets] : []
			};
		} else {
			formData = {
				name: '', code: '', discount_type: 'percentage', value: '',
				min_order_amount: null, max_discount_amount: null, applies_to: 'order',
				start_date: '', end_date: '', usage_limit: null, is_active: true, targets: []
			};
		}
	}

	function addTarget() {
		if (!targetId) return;
		const nt = targetType === 'category' ? { category_id: targetId } : { menu_item_id: targetId };
		const targets = formData.targets ?? [];
		if (!targets.some(t => t.category_id === targetId || t.menu_item_id === targetId)) {
			formData.targets = [...targets, nt];
		}
		targetId = '';
	}

	function removeTarget(i: number) {
		if (formData.targets) formData.targets = formData.targets.filter((_, idx) => idx !== i);
	}

	function handleSubmit() {
		if (!formData.name || !formData.code || formData.value === '') {
			alert('Nama, kode, dan nilai wajib diisi!');
			return;
		}
		dispatch('save', formData);
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
		<div class="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
			<div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
				<h2 class="text-xl font-bold">{discount ? 'Edit Diskon' : 'Buat Diskon Baru'}</h2>
				<button on:click={() => dispatch('close')} class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
			</div>
			<form on:submit|preventDefault={handleSubmit} class="p-6 overflow-y-auto space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-1">Nama Diskon *</label>
						<input type="text" bind:value={formData.name} required class="w-full border rounded-lg p-2.5 text-sm" placeholder="Diskon Merdeka" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-1">Kode Promo *</label>
						<input type="text" bind:value={formData.code} required class="w-full border rounded-lg p-2.5 text-sm uppercase" placeholder="MERDEKA" />
					</div>
				</div>



				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-1">Tipe Diskon *</label>
						<select bind:value={formData.discount_type} class="w-full border rounded-lg p-2.5 text-sm">
							<option value="percentage">Persentase (%)</option>
							<option value="fixed_amount">Nominal (Rp)</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium mb-1">Nilai *</label>
						<input type="number" step="any" bind:value={formData.value} required class="w-full border rounded-lg p-2.5 text-sm" placeholder="10" />
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-1">Min Order (Rp)</label>
						<input type="number" bind:value={formData.min_order_amount} class="w-full border rounded-lg p-2.5 text-sm" placeholder="0" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-1">Max Diskon (Rp)</label>
						<input type="number" bind:value={formData.max_discount_amount} class="w-full border rounded-lg p-2.5 text-sm" placeholder="Opsional" />
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-1">Berlaku Untuk *</label>
						<select bind:value={formData.applies_to} class="w-full border rounded-lg p-2.5 text-sm">
							<option value="order">Seluruh Pesanan</option>
							<option value="item">Item / Kategori</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium mb-1">Batas Penggunaan</label>
						<input type="number" bind:value={formData.usage_limit} class="w-full border rounded-lg p-2.5 text-sm" placeholder="Tak Terbatas" />
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-1">Tanggal Mulai</label>
						<input type="date" bind:value={formData.start_date} class="w-full border rounded-lg p-2.5 text-sm" />
					</div>
					<div>
						<label class="block text-sm font-medium mb-1">Tanggal Berakhir</label>
						<input type="date" bind:value={formData.end_date} class="w-full border rounded-lg p-2.5 text-sm" />
					</div>
				</div>
				{#if formData.applies_to === 'item'}
					<div class="border rounded-lg p-4 bg-gray-50 space-y-3">
						<label class="block text-sm font-semibold">Target Item/Kategori</label>
						<div class="flex gap-2">
							<select bind:value={targetType} class="border rounded-lg p-2 text-sm">
								<option value="category">Kategori</option>
								<option value="menu_item">Menu Item</option>
							</select>
							{#if targetType === 'category'}
								<select bind:value={targetId} class="flex-1 border rounded-lg p-2 text-sm">
									<option value="">-- Pilih Kategori --</option>
									{#each $categoriesStore.categories as c}<option value={c.id}>{c.name}</option>{/each}
								</select>
							{:else}
								<select bind:value={targetId} class="flex-1 border rounded-lg p-2 text-sm">
									<option value="">-- Pilih Menu Item --</option>
									{#each $menuItemsStore.items as m}<option value={m.id}>{m.name}</option>{/each}
								</select>
							{/if}
							<button type="button" on:click={addTarget} class="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm">Tambah</button>
						</div>
						{#if formData.targets && formData.targets.length > 0}
							<div class="flex flex-wrap gap-2 pt-2">
								{#each formData.targets as t, i}
									<span class="inline-flex items-center gap-1 px-3 py-1 bg-white border rounded-full text-xs">
										{#if t.category_id}Kategori: {$categoriesStore.categories.find(c => c.id === t.category_id)?.name}
										{:else if t.menu_item_id}Item: {$menuItemsStore.items.find(m => m.id === t.menu_item_id)?.name}{/if}
										<button type="button" on:click={() => removeTarget(i)} class="text-red-500 font-bold">&times;</button>
									</span>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
				<div class="flex items-center gap-2">
					<input type="checkbox" id="is_active" bind:checked={formData.is_active} class="w-4 h-4 rounded text-primary-600" />
					<label for="is_active" class="text-sm font-medium">Diskon Aktif</label>
				</div>
				<div class="flex justify-end gap-3 pt-4 border-t">
					<button type="button" on:click={() => dispatch('close')} class="px-4 py-2 border rounded-lg text-sm">Batal</button>
					<button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">Simpan</button>
				</div>
			</form>
		</div>
	</div>
{/if}
