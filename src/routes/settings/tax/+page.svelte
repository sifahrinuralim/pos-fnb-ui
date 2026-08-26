<script lang="ts">
	import { onMount } from 'svelte';
	import { listTaxConfigs, createTaxConfig, updateTaxConfig, deleteTaxConfig } from '$lib/api/settings';
	import type { TaxConfig } from '$lib/api/settings';

	let taxConfigs: TaxConfig[] = [];
	let newConfig = { name: '', rate: 0, is_active: false };
	let editingId: number | null = null;

	async function loadConfigs() {
		const res = await listTaxConfigs();
		if (res.success) taxConfigs = res.data;
	}

	async function handleSubmit() {
		if (editingId) {
			await updateTaxConfig(editingId, newConfig);
		} else {
			await createTaxConfig(newConfig as any);
		}
		newConfig = { name: '', rate: 0, is_active: false };
		editingId = null;
		loadConfigs();
	}

	function edit(config: TaxConfig) {
		editingId = config.id;
		newConfig = { name: config.name, rate: config.rate, is_active: config.is_active };
	}

	onMount(loadConfigs);
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold mb-4">Tax Configuration</h1>
	
	<form on:submit|preventDefault={handleSubmit} class="mb-8 p-4 bg-gray-50 rounded">
		<input bind:value={newConfig.name} placeholder="Name" class="border p-2 mr-2" />
		<input type="number" bind:value={newConfig.rate} placeholder="Rate (%)" class="border p-2 mr-2" />
		<label class="mr-2">
			<input type="checkbox" bind:checked={newConfig.is_active} /> Active
		</label>
		<button type="submit" class="bg-blue-500 text-white p-2 rounded">{editingId ? 'Update' : 'Create'}</button>
	</form>

	<ul>
		{#each taxConfigs as config}
			<li class="border-b p-2 flex justify-between">
				{config.name} ({config.rate}%) - {config.is_active ? 'Active' : 'Inactive'}
				<div>
					<button on:click={() => edit(config)} class="text-blue-500 mr-2">Edit</button>
					<button on:click={() => deleteTaxConfig(config.id).then(loadConfigs)} class="text-red-500">Delete</button>
				</div>
			</li>
		{/each}
	</ul>
</div>
