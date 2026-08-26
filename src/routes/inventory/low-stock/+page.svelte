<script lang="ts">
    import { onMount } from 'svelte';
    import { inventoryStore } from '$lib/stores/inventory';

    onMount(() => inventoryStore.loadLowStock());
</script>

<div class="p-6">
    <h1 class="text-2xl font-bold mb-4 text-red-600">Low Stock Items</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each $inventoryStore.lowStockItems as item}
        <div class="border p-4 rounded shadow bg-red-50">
            <h2 class="font-bold text-lg">{item.ingredient_name}</h2>
            <p>Current: {item.stock_quantity} {item.unit}</p>
            <p class="text-red-600 font-semibold">Min: {item.minimum_stock} {item.unit}</p>
        </div>
        {/each}
    </div>
</div>
