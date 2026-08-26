<script lang="ts">
    import { getBestSelling, type BestSelling } from '$lib/services/reports';

    let startDate = new Date().toISOString().split('T')[0];
    let endDate = new Date().toISOString().split('T')[0];
    let limit = 10;
    let data: BestSelling[] = [];
    let loading = false;

    async function fetchData() {
        loading = true;
        const res = await getBestSelling(limit, startDate, endDate);
        data = res.data;
        loading = false;
    }
</script>

<div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Best Selling</h1>
    <div class="flex gap-4 mb-6">
        <input type="date" bind:value={startDate} class="border p-2 rounded" />
        <input type="date" bind:value={endDate} class="border p-2 rounded" />
        <input type="number" bind:value={limit} class="border p-2 rounded w-20" />
        <button on:click={fetchData} class="bg-blue-600 text-white px-4 py-2 rounded">Filter</button>
    </div>

    <table class="w-full border-collapse">
        <thead>
            <tr><th class="border p-2">Item</th><th class="border p-2">Qty</th><th class="border p-2">Revenue</th></tr>
        </thead>
        <tbody>
            {#each data as item}
            <tr>
                <td class="border p-2">{item.menu_item_name}</td>
                <td class="border p-2">{item.total_quantity_sold}</td>
                <td class="border p-2">{item.total_revenue}</td>
            </tr>
            {/each}
        </tbody>
    </table>
</div>
