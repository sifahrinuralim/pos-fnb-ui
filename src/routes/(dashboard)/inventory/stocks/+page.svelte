<script lang="ts">
    import { onMount } from 'svelte';
    import { inventoryStore } from '$lib/stores/inventory';
    import { toggleOutOfStockAvailability } from '$lib/services/inventory';

    onMount(() => inventoryStore.loadInventory());

    async function handleToggle() {
        try {
            await toggleOutOfStockAvailability();
            alert('Availability toggled successfully');
        } catch (e) {
            alert('Failed to toggle availability');
        }
    }
</script>

<div class="p-6">
    <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Stock Management</h1>
        <button 
            on:click={handleToggle}
            class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
            Toggle Global Availability
        </button>
    </div>
    <table class="w-full border-collapse">
        <thead>
            <tr class="bg-gray-100">
                <th class="p-2 border">Ingredient</th>
                <th class="p-2 border">Unit</th>
                <th class="p-2 border">Quantity</th>
                <th class="p-2 border">Min</th>
                <th class="p-2 border">Price</th>
                <th class="p-2 border">Status</th>
            </tr>
        </thead>
        <tbody>
            {#each $inventoryStore.inventory as item}
            <tr class={item.is_low_stock ? 'bg-red-100' : ''}>
                <td class="p-2 border">{item.ingredient_name}</td>
                <td class="p-2 border">{item.unit}</td>
                <td class="p-2 border">{item.stock_quantity}</td>
                <td class="p-2 border">{item.minimum_stock}</td>
                <td class="p-2 border">{item.unit_price}</td>
                <td class="p-2 border">
                    {#if item.is_low_stock}
                        <span class="bg-red-500 text-white px-2 py-1 rounded text-xs">Low Stock</span>
                    {/if}
                </td>
            </tr>
            {/each}
        </tbody>
    </table>
</div>
