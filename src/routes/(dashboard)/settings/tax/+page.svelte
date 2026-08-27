<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Pencil, Trash2, Power, Loader2, Save, X, SlidersHorizontal } from 'lucide-svelte';
	import { listTaxConfigs, createTaxConfig, updateTaxConfig, deleteTaxConfig } from '$lib/api/settings';

	interface TaxConfig {
		id: number;
		name: string;
		service_charge_rate: number;
		ppn_rate: number;
		is_active: boolean;
		created_at?: string;
		updated_at?: string;
	}

	let taxConfigs: TaxConfig[] = [];
	let loading = true;
	let saving = false;
	let error = '';
	let successMessage = '';

	// ── Form state ──
	let showForm = false;
	let editingId: number | null = null;
	let form = { name: '', service_charge_rate: 0, ppn_rate: 0, is_active: false };

	function resetForm(): void {
		form = { name: '', service_charge_rate: 0, ppn_rate: 0, is_active: false };
	}

	async function loadConfigs(): Promise<void> {
		loading = true;
		error = '';
		try {
			const res = await listTaxConfigs();
			if (res.success) {
				taxConfigs = Array.isArray(res.data) ? res.data : [];
			} else {
				error = res.message ?? 'Gagal memuat konfigurasi pajak.';
			}
		} catch (e: any) {
			error = e?.message ?? 'Gagal memuat konfigurasi pajak.';
		} finally {
			loading = false;
		}
	}

	function openCreate(): void {
		editingId = null;
		resetForm();
		showForm = true;
		error = '';
		successMessage = '';
	}

	function openEdit(config: TaxConfig): void {
		editingId = config.id;
		form = {
			name: config.name,
			service_charge_rate: config.service_charge_rate,
			ppn_rate: config.ppn_rate,
			is_active: config.is_active
		};
		showForm = true;
		error = '';
		successMessage = '';
	}

	function closeForm(): void {
		showForm = false;
		editingId = null;
		resetForm();
	}

	async function handleSubmit(): Promise<void> {
		if (!form.name.trim()) {
			error = 'Nama konfigurasi wajib diisi.';
			return;
		}
		saving = true;
		error = '';
		successMessage = '';
		try {
			const payload = {
				name: form.name.trim(),
				service_charge_rate: Number(form.service_charge_rate) || 0,
				ppn_rate: Number(form.ppn_rate) || 0,
				is_active: form.is_active
			};
			const res = editingId
				? await updateTaxConfig(editingId, payload)
				: await createTaxConfig(payload);
			if (!res.success) {
				error = res.message ?? 'Gagal menyimpan konfigurasi pajak.';
				return;
			}
			successMessage = editingId
				? 'Konfigurasi pajak berhasil diperbarui.'
				: 'Konfigurasi pajak berhasil dibuat.';
			closeForm();
			await loadConfigs();
		} catch (e: any) {
			error = e?.message ?? 'Gagal menyimpan konfigurasi pajak.';
		} finally {
			saving = false;
		}
	}

	async function toggleActive(config: TaxConfig): Promise<void> {
		error = '';
		successMessage = '';
		try {
			const res = await updateTaxConfig(config.id, { is_active: !config.is_active });
			if (!res.success) {
				error = res.message ?? 'Gagal mengubah status konfigurasi pajak.';
				return;
			}
			successMessage = config.is_active
				? 'Konfigurasi pajak dinonaktifkan.'
				: 'Konfigurasi pajak diaktifkan.';
			await loadConfigs();
		} catch (e: any) {
			error = e?.message ?? 'Gagal mengubah status konfigurasi pajak.';
		}
	}

	async function handleDelete(config: TaxConfig): Promise<void> {
		if (!confirm(`Hapus konfigurasi pajak "${config.name}"?`)) return;
		error = '';
		successMessage = '';
		try {
			const res = await deleteTaxConfig(config.id);
			if (!res.success) {
				error = res.message ?? 'Gagal menghapus konfigurasi pajak.';
				return;
			}
			successMessage = 'Konfigurasi pajak berhasil dihapus.';
			await loadConfigs();
		} catch (e: any) {
			error = e?.message ?? 'Gagal menghapus konfigurasi pajak.';
		}
	}

	onMount(loadConfigs);
</script>

<svelte:head>
	<title>Pengaturan Pajak — POS F&B</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<div class="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 text-primary-600">
				<SlidersHorizontal class="w-6 h-6" />
			</div>
			<div>
				<h1 class="text-2xl font-bold text-gray-900">Konfigurasi Pajak</h1>
				<p class="text-sm text-gray-500">Atur service charge & PPN untuk perhitungan order</p>
			</div>
		</div>
		<button class="btn-primary flex items-center gap-2" on:click={openCreate}>
			<Plus class="w-4 h-4" /> Tambah Konfigurasi
		</button>
	</div>

	{#if error}
		<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>
	{/if}
	{#if successMessage}
		<div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{successMessage}</div>
	{/if}

	{#if showForm}
		<form on:submit|preventDefault={handleSubmit} class="card space-y-4 !p-5">
			<h2 class="text-base font-bold text-gray-900">{editingId ? 'Edit Konfigurasi Pajak' : 'Tambah Konfigurasi Pajak'}</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700" for="tax-name">Nama</label>
					<input id="tax-name" type="text" bind:value={form.name} placeholder="contoh: Standar Dine-in" class="input-field" />
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700" for="tax-sc">Service Charge (%)</label>
					<input id="tax-sc" type="number" min="0" max="100" step="0.01" bind:value={form.service_charge_rate} class="input-field" />
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700" for="tax-ppn">PPN (%)</label>
					<input id="tax-ppn" type="number" min="0" max="100" step="0.01" bind:value={form.ppn_rate} class="input-field" />
				</div>
			</div>
			<label class="flex items-center gap-2 text-sm font-medium text-gray-700">
				<input type="checkbox" bind:checked={form.is_active} class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
				Aktifkan konfigurasi ini
			</label>
			<div class="flex items-center gap-2">
				<button type="submit" class="btn-primary flex items-center gap-2" disabled={saving}>
					{#if saving}
						<Loader2 class="w-4 h-4 animate-spin" /> Menyimpan...
					{:else}
						<Save class="w-4 h-4" /> {editingId ? 'Perbarui' : 'Simpan'}
					{/if}
				</button>
				<button type="button" class="btn-secondary flex items-center gap-2" on:click={closeForm}>
					<X class="w-4 h-4" /> Batal
				</button>
			</div>
		</form>
	{/if}

	<div class="card !p-0 overflow-hidden">
		{#if loading}
			<div class="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
				<Loader2 class="w-5 h-5 animate-spin" /> Memuat konfigurasi pajak...
			</div>
		{:else if taxConfigs.length === 0}
			<div class="py-16 text-center">
				<p class="text-sm font-medium text-gray-700">Belum ada konfigurasi pajak</p>
				<p class="mt-1 text-sm text-gray-500">Klik "Tambah Konfigurasi" untuk membuat yang pertama.</p>
			</div>
		{:else}
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
						<th class="px-5 py-3.5">Nama</th>
						<th class="px-5 py-3.5">Service Charge</th>
						<th class="px-5 py-3.5">PPN</th>
						<th class="px-5 py-3.5">Status</th>
						<th class="px-5 py-3.5 text-right">Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#each taxConfigs as config (config.id)}
						<tr class="border-b border-gray-100 last:border-0">
							<td class="px-5 py-3.5 font-medium text-gray-900">{config.name}</td>
							<td class="px-5 py-3.5 text-gray-600">{config.service_charge_rate}%</td>
							<td class="px-5 py-3.5 text-gray-600">{config.ppn_rate}%</td>
							<td class="px-5 py-3.5">
								<span class={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
									<span class={`w-1.5 h-1.5 rounded-full ${config.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
									{config.is_active ? 'Aktif' : 'Nonaktif'}
								</span>
							</td>
							<td class="px-5 py-3.5">
								<div class="flex items-center justify-end gap-1">
									<button
										class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition {config.is_active ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}"
										on:click={() => toggleActive(config)}
										title={config.is_active ? 'Nonaktifkan' : 'Aktifkan'}
									>
										<Power class="w-3.5 h-3.5" />
										{config.is_active ? 'Nonaktifkan' : 'Aktifkan'}
									</button>
									<button class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50" on:click={() => openEdit(config)}>
										<Pencil class="w-3.5 h-3.5" /> Edit
									</button>
									<button class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50" on:click={() => handleDelete(config)}>
										<Trash2 class="w-3.5 h-3.5" /> Hapus
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
