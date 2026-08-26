<script lang="ts">
	import { onMount } from 'svelte';
	import { discountsStore } from '$lib/stores/discounts';
	import { Plus, Pencil, Trash2, Tag } from 'lucide-svelte';
	import DiscountModal from '$lib/components/discount/DiscountModal.svelte';

	let showModal = false;
	let editingDiscount: any = null;
	let activeOnly = false;

	onMount(() => discountsStore.loadDiscounts(activeOnly));

	function openModal(discount: any = null) {
		editingDiscount = discount;
		showModal = true;
	}

	async function handleSave(event: CustomEvent) {
		const data = event.detail;
		if (editingDiscount) await discountsStore.updateDiscount(editingDiscount.id, data);
		else await discountsStore.createDiscount(data);
		showModal = false;
		discountsStore.loadDiscounts(activeOnly);
	}

	async function deleteDiscount(id: string) {
		if (confirm('Yakin ingin menghapus diskon ini?')) {
			await discountsStore.deleteDiscount(id);
			discountsStore.loadDiscounts(activeOnly);
		}
	}
</script>

<div class="p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold flex items-center gap-2"><Tag /> Diskon & Promo</h1>
		<div class="flex items-center gap-4">
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={activeOnly} on:change={() => discountsStore.loadDiscounts(activeOnly)} />
				Hanya Aktif
			</label>
			<button on:click={() => openModal()} class="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
				<Plus size={16} /> Buat Diskon
			</button>
		</div>
	</div>

	<table class="w-full bg-white rounded-xl shadow">
		<thead>
			<tr class="border-b text-left">
				<th class="p-4">Nama</th>
				<th class="p-4">Kode</th>
				<th class="p-4">Tipe</th>
				<th class="p-4">Nilai</th>
				<th class="p-4">Status</th>
				<th class="p-4">Aksi</th>
			</tr>
		</thead>
		<tbody>
			{#each $discountsStore.discounts as d}
				<tr class="border-b">
					<td class="p-4">{d.name}</td>
					<td class="p-4 font-mono">{d.code}</td>
					<td class="p-4">{d.discount_type === 'percentage' ? '%' : 'Rp'}</td>
					<td class="p-4">{d.value}</td>
					<td class="p-4">
						<span class={`px-2 py-1 rounded text-xs ${d.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
							{d.is_active ? 'Active' : 'Inactive'}
						</span>
					</td>
					<td class="p-4 flex gap-2">
						<button on:click={() => openModal(d)} class="text-blue-600"><Pencil size={16} /></button>
						<button on:click={() => deleteDiscount(d.id)} class="text-red-600"><Trash2 size={16} /></button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<DiscountModal open={showModal} discount={editingDiscount} on:close={() => showModal = false} on:save={handleSave} />
</div>
