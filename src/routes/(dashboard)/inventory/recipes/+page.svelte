<script lang="ts">
    import { onMount } from 'svelte';
    import { menuItemsStore } from '$lib/stores/menu-items';
    import { listIngredients, listRecipe, setRecipe, checkAvailability } from '$lib/services/inventory';
    import type { Ingredient, RecipeIngredient } from '$lib/services/inventory';

    let menuItems: any[] = [];
    let selectedMenuItemId = '';
    let ingredients: Ingredient[] = [];
    let recipe: RecipeIngredient[] = [];
    let newRecipe: { ingredient_id: string; quantity: number }[] = [];
    let availabilityResult: any = null;

    onMount(async () => {
        await menuItemsStore.loadMenuItems();
        menuItems = $menuItemsStore.items;
        const res = await listIngredients();
        if (res.success) ingredients = res.data;
    });

    async function loadRecipe() {
        if (!selectedMenuItemId) return;
        const res = await listRecipe(selectedMenuItemId);
        if (res.success) {
            recipe = res.data;
            newRecipe = recipe.map(r => ({ ingredient_id: r.ingredient_id, quantity: r.quantity }));
        }
    }

    async function saveRecipe() {
        if (!selectedMenuItemId) return;
        const res = await setRecipe(selectedMenuItemId, newRecipe);
        if (res.success) alert('Recipe saved successfully');
    }

    async function checkStock() {
        if (!selectedMenuItemId) return;
        const res = await checkAvailability(selectedMenuItemId, 1);
        if (res.success) availabilityResult = res.data;
    }
</script>

<div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Recipe Management</h1>
    
    <select bind:value={selectedMenuItemId} on:change={loadRecipe} class="border p-2 mb-4 w-full">
        <option value="">Select Menu Item</option>
        {#each menuItems as item}
            <option value={item.id}>{item.name}</option>
        {/each}
    </select>

    {#if selectedMenuItemId}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h2 class="text-xl font-bold mb-2">Current Ingredients</h2>
                {#each recipe as r}
                    <div class="p-2 border mb-1 flex justify-between">
                        {r.ingredient_name} - {r.quantity} {r.unit}
                    </div>
                {/each}
            </div>

            <div>
                <h2 class="text-xl font-bold mb-2">Manage Recipe</h2>
                {#each newRecipe as r, i}
                    <div class="flex gap-2 mb-2">
                        <select bind:value={r.ingredient_id} class="border p-1 w-full">
                            {#each ingredients as ing}
                                <option value={ing.id}>{ing.name}</option>
                            {/each}
                        </select>
                        <input type="number" bind:value={r.quantity} class="border p-1 w-20" placeholder="Qty" />
                        <button on:click={() => newRecipe.splice(i, 1)} class="text-red-500">X</button>
                    </div>
                {/each}
                <button on:click={() => newRecipe = [...newRecipe, { ingredient_id: '', quantity: 0 }]} class="bg-green-500 text-white px-4 py-1 mt-2">Add Ingredient</button>
                <button on:click={saveRecipe} class="bg-blue-500 text-white px-4 py-1 mt-2">Save Recipe</button>
                <button on:click={checkStock} class="bg-yellow-500 text-white px-4 py-1 mt-2">Check Availability</button>
            </div>
        </div>

        {#if availabilityResult}
            <div class="mt-4 p-4 border {availabilityResult.is_available ? 'bg-green-100' : 'bg-red-100'}">
                <h3 class="font-bold">Availability: {availabilityResult.is_available ? 'Available' : 'Unavailable'}</h3>
                {#if !availabilityResult.is_available}
                    <p>Missing:</p>
                    <ul>
                        {#each availabilityResult.missing_ingredients as m}
                            <li>{m.ingredient_name} ({m.quantity} {m.unit} needed)</li>
                        {/each}
                    </ul>
                {/if}
            </div>
        {/if}
    {/if}
</div>
