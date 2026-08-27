<script lang="ts">
	import { onMount } from 'svelte';
	import { Loader2, Save, Store } from 'lucide-svelte';
	import { getActiveStoreSetting, createStoreSetting, updateStoreSetting } from '$lib/api/settings';

	interface StoreSetting {
		id?: number;
		store_name: string;
		address: string | null;
		phone: string | null;
		email: string | null;
		logo_url: string | null;
		receipt_footer: string | null;
		tax_invoice_number: string | null;
	}

	let loaded = false;
	let saving = false;
	let error = '';
	let successMessage = '';
	let form: StoreSetting = {
		store_name: '',
		address: '',
		phone: '',
		email: '',
		logo_url: '',
		receipt_footer: '',
		tax_invoice_number: ''
	};

	async function loadSettings(): Promise<void> {
		try {
			const res = await getActiveStoreSetting();
			if (res.success && res.data && res.data.id) {
				form = {
					id: res.data.id,
					store_name: res.data.store_name ?? '',
					address: res.data.address ?? '',
					phone: res.data.phone ?? '',
					email: res.data.email ?? '',
					logo_url: res.data.logo_url ?? '',
					receipt_footer: res.data.receipt_footer ?? '',
					tax_invoice_number: res.data.tax_invoice_number ?? ''
				};
			}
		} catch {
			/* non-fatal: form tetap kosong agar pengaturan baru bisa dibuat */
		} finally {
			loaded = true;
		}
	}

	async function handleSubmit(): Promise<void> {
		if (!form.store_name.trim()) {
			error = 'Nama outlet wajib diisi.';
			return;
		}
		saving = true;
		error = '';
		successMessage = '';
		try {
			const payload = {
				store_name: form.store_name.trim(),
				address: form.address?.trim() || null,
				phone: form.phone?.trim() || null,
				email: form.email?.trim() || null,
				logo_url: form.logo_url?.trim() || null,
				receipt_footer: form.receipt_footer?.trim() || null,
				tax_invoice_number: form.tax_invoice_number?.trim() || null
			};
			const res = form.id
				? await updateStoreSetting(form.id, payload)
				: await createStoreSetting(payload);
			if (!res.success) {
				error = res.message ?? 'Gagal menyimpan pengaturan outlet.';
				return;
			}
			if (res.data && res.data.id) form.id = res.data.id;
			successMessage = 'Pengaturan outlet berhasil disimpan.';
		} catch (e: any) {
			error = e?.message ?? 'Gagal menyimpan pengaturan outlet.';
		} finally {
			saving = false;
		}
	}

	onMount(loadSettings);
</script>

<svelte:head>
	<title>Pengaturan Outlet — POS F&B</title>
</svelte:head>

<div class="space-y-6 max-w-3xl">
	<div class="flex items-center gap-3">
		<div class="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 text-primary-600">
			<Store class="w-6 h-6" />
		</div>
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Pengaturan Outlet</h1>
			<p class="text-sm text-gray-500">Informasi outlet untuk tampil pada struk & dokumen pajak</p>
		</div>
	</div>

	{#if error}
		<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>
	{/if}
	{#if successMessage}
		<div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{successMessage}</div>
	{/if}

	{#if !loaded}
		<div class="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
			<Loader2 class="w-5 h-5 animate-spin" /> Memuat pengaturan outlet...
		</div>
	{:else}
		<form on:submit|preventDefault={handleSubmit} class="card space-y-4 !p-6">
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700" for="store-name">Nama Outlet *</label>
				<input id="store-name" type="text" bind:value={form.store_name} placeholder="Nama outlet / restoran" class="input-field" />
			</div>
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700" for="store-address">Alamat</label>
				<textarea id="store-address" rows="3" bind:value={form.address} placeholder="Alamat lengkap outlet" class="input-field"></textarea>
			</div>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700" for="store-phone">Telepon</label>
					<input id="store-phone" type="text" bind:value={form.phone} placeholder="Nomor telepon outlet" class="input-field" />
				</div>
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700" for="store-email">Email</label>
					<input id="store-email" type="email" bind:value={form.email} placeholder="email@outlet.com" class="input-field" />
				</div>
			</div>
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700" for="store-logo">Logo URL</label>
				<input id="store-logo" type="url" bind:value={form.logo_url} placeholder="https://..." class="input-field" />
			</div>
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700" for="store-footer">Footer Struk</label>
				<textarea id="store-footer" rows="2" bind:value={form.receipt_footer} placeholder="Pesan terima kasih / info tambahan di struk" class="input-field"></textarea>
			</div>
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700" for="store-tax">Nomor Faktur Pajak</label>
				<input id="store-tax" type="text" bind:value={form.tax_invoice_number} placeholder="Nomor faktur pajak outlet" class="input-field" />
			</div>

			<div class="pt-2">
				<button type="submit" class="btn-primary flex items-center gap-2" disabled={saving}>
					{#if saving}
						<Loader2 class="w-4 h-4 animate-spin" /> Menyimpan...
					{:else}
						<Save class="w-4 h-4" /> Simpan Pengaturan
					{/if}
				</button>
			</div>
		</form>
	{/if}
</div>
