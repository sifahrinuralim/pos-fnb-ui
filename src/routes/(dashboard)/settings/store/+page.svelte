<script lang="ts">
	import { onMount } from 'svelte';
	import { getActiveStoreSetting, updateStoreSetting } from '$lib/api/settings';
	import type { StoreSetting } from '$lib/api/settings';

	let setting: Partial<StoreSetting> = {
		store_name: '', address: '', phone: '', email: '', logo_url: '', receipt_footer: '', tax_invoice_number: ''
	};

	async function loadSettings() {
		const res = await getActiveStoreSetting();
		if (res.success) setting = res.data;
	}

	async function handleSubmit() {
		if (setting.id) {
			await updateStoreSetting(setting.id, setting);
			alert('Settings updated');
		}
	}

	onMount(loadSettings);
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold mb-4">Store Settings</h1>
	<form on:submit|preventDefault={handleSubmit} class="grid gap-4 max-w-lg">
		<input bind:value={setting.store_name} placeholder="Store Name" class="border p-2" />
		<input bind:value={setting.address} placeholder="Address" class="border p-2" />
		<input bind:value={setting.phone} placeholder="Phone" class="border p-2" />
		<input bind:value={setting.email} placeholder="Email" class="border p-2" />
		<input bind:value={setting.receipt_footer} placeholder="Receipt Footer" class="border p-2" />
		<button type="submit" class="bg-green-500 text-white p-2 rounded">Save</button>
	</form>
</div>
