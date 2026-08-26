<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { getPriceBook, listProductPrices, createProductPrice, type PriceBook, type ProductPrice } from '$lib/api/pricing.api';

    const id = parseInt($page.params.id);
    let priceBook: PriceBook | null = null;
    let productPrices: ProductPrice[] = [];
    
    let newItem = { menu_item_id: '', variant_id: '', override_price: '' };

    async function loadData() {
        const [pbRes, ppRes] = await Promise.all([getPriceBook(id), listProductPrices(id)]);
        if (pbRes.success) priceBook = pbRes.data;
        if (ppRes.success) productPrices = ppRes.data;
    }

    async function handleAdd() {
        const res = await createProductPrice({
            price_book_id: id,
            menu_item_id: parseInt(newItem.menu_item_id),
            variant_id: newItem.variant_id ? parseInt(newItem.variant_id) : null,
            override_price: parseFloat(newItem.override_price)
        });
        if (res.success) {
            newItem = { menu_item_id: '', variant_id: '', override_price: '' };
            loadData();
        }
    }

    onMount(loadData);
</script>

<div class="p-6">
    {#if priceBook}
        <h1 class="text-2xl font-bold">{priceBook.name}</h1>
        <p class="mb-4">{priceBook.description || ''}</p>

        <h2 class="text-xl font-semibold mb-2">Product Prices</h2>
        <table class="w-full border-collapse border mb-6">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border p-2">Menu Item ID</th>
                    <th class="border p-2">Variant ID</th>
                    <th class="border p-2">Price</th>
                </tr>
            </thead>
            <tbody>
                {#each productPrices as pp}
                    <tr>
                        <td class="border p-2">{pp.menu_item_id}</td>
                        <td class="border p-2">{pp.variant_id || '-'}</td>
                        <td class="border p-2">{pp.override_price}</td>
                    </tr>
                {/each}
            </tbody>
        </table>

        <div class="p-4 border bg-gray-50">
            <h3 class="font-bold mb-2">Add Product Price</h3>
            <div class="flex gap-2">
                <input type="number" placeholder="Menu Item ID" bind:value={newItem.menu_item_id} class="border p-1" />
                <input type="number" placeholder="Variant ID" bind:value={newItem.variant_id} class="border p-1" />
                <input type="number" placeholder="Price" bind:value={newItem.override_price} class="border p-1" />
                <button on:click={handleAdd} class="bg-blue-600 text-white px-4 py-1">Add</button>
            </div>
        </div>
    {/if}
</div>
