<script lang="ts">
	import { onMount } from 'svelte';
	import { tables, loading, statusFilter, loadTables, deleteTable } from '$lib/stores/tables';

	const statuses = ['all', 'available', 'occupied', 'reserved'];

	onMount(() => {
		loadTables();
	});

	$: loadTables($statusFilter);

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'available': return 'bg-green-100 text-green-800';
			case 'occupied': return 'bg-red-100 text-red-800';
			case 'reserved': return 'bg-yellow-100 text-yellow-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};
</script>

<div class="p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold">Manajemen Meja</h1>
		<select bind:value={$statusFilter} class="p-2 border rounded">
			{#each statuses as status}
				<option value={status}>{status.toUpperCase()}</option>
			{/each}
		</select>
	</div>

	{#if $loading}
		<p>Memuat meja...</p>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
			{#each $tables as table}
				<div class="border rounded-lg p-4 shadow-sm bg-white">
					<div class="flex justify-between">
						<span class="font-bold text-lg">#{table.table_number}</span>
						<span class={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(table.status)}`}>
							{table.status.toUpperCase()}
						</span>
					</div>
					<p class="text-gray-600">{table.name || '-'}</p>
					<p class="text-sm mt-2">Kapasitas: {table.seat_capacity} kursi</p>
					<button on:click={() => deleteTable(table.id)} class="mt-4 text-red-500 text-sm">Hapus</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
