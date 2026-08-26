<script lang="ts">
    import { onMount } from 'svelte';
    import { listPriceBooks, type PriceBook } from '$lib/api/pricing.api';

    let priceBooks: PriceBook[] = [];
    let loading = true;

    onMount(async () => {
        const res = await listPriceBooks();
        if (res.success) {
            priceBooks = res.data;
        }
        loading = false;
    });
</script>

<div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Price Books</h1>
    {#if loading}
        <p>Loading...</p>
    {:else}
        <table class="w-full border-collapse border border-gray-300">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border p-2">Name</th>
                    <th class="border p-2">Description</th>
                    <th class="border p-2">Order Type</th>
                    <th class="border p-2">Default</th>
                    <th class="border p-2">Active</th>
                </tr>
            </thead>
            <tbody>
                {#each priceBooks as pb}
                    <tr>
                        <td class="border p-2"><a href="/pricing/price-books/{pb.id}" class="text-blue-500 hover:underline">{pb.name}</a></td>
                        <td class="border p-2">{pb.description || '-'}</td>
                        <td class="border p-2">{pb.order_type}</td>
                        <td class="border p-2">{pb.is_default ? 'Yes' : 'No'}</td>
                        <td class="border p-2">{pb.is_active ? 'Yes' : 'No'}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>
