<script lang="ts">
    import { onMount } from 'svelte';
    import { inventoryStore } from '$lib/stores/inventory';
    import { createIngredient } from '$lib/services/inventory';

    onMount(() => inventoryStore.loadIngredients());

    let name = '';
    let unit = '';

    async function handleCreate() {
        await createIngredient({ name, unit, is_active: true });
        name = '';
        unit = '';
        inventoryStore.loadIngredients();
    }
</script>

<div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Ingredients</h1>
    <div class="mb-6 flex gap-2">
        <input bind:value={name} placeholder="Name" class="border p-2 rounded" />
        <input bind:value={unit} placeholder="Unit" class="border p-2 rounded" />
        <button on:click={handleCreate} class="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
    </div>
    <table class="w-full border-collapse">
        <thead>
            <tr class="bg-gray-100">
                <th class="p-2 border">Name</th>
                <th class="p-2 border">Unit</th>
                <th class="p-2 border">Active</th>
            </tr>
        </thead>
        <tbody>
            {#each $inventoryStore.ingredients as item}
            <tr>
                <td class="p-2 border">{item.name}</td>
                <td class="p-2 border">{item.unit}</td>
                <td class="p-2 border">{item.is_active ? 'Yes' : 'No'}</td>
            </tr>
            {/each}
        </tbody>
    </table>
</div>
