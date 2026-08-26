<script lang="ts">
    import { getSalesSummary, type SalesSummary } from '$lib/services/reports';
    import { onMount } from 'svelte';

    let startDate = new Date().toISOString().split('T')[0];
    let endDate = new Date().toISOString().split('T')[0];
    let data: SalesSummary | null = null;
    let loading = false;
    let error = '';

    async function fetchData() {
        loading = true;
        error = '';
        try {
            const res = await getSalesSummary(startDate, endDate);
            data = res.data;
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Sales Summary</h1>
    <div class="flex gap-4 mb-6">
        <input type="date" bind:value={startDate} class="border p-2 rounded" />
        <input type="date" bind:value={endDate} class="border p-2 rounded" />
        <button on:click={fetchData} class="bg-blue-600 text-white px-4 py-2 rounded">Filter</button>
    </div>

    {#if loading}
        <p>Loading...</p>
    {:else if error}
        <p class="text-red-500">{error}</p>
    {:else if data}
        <div class="grid grid-cols-3 gap-4">
            <div class="p-4 bg-white shadow rounded">Gross: {data.total_gross_revenue}</div>
            <div class="p-4 bg-white shadow rounded">Discount: {data.total_discount_amount}</div>
            <div class="p-4 bg-white shadow rounded">Net: {data.net_revenue}</div>
        </div>
    {/if}
</div>
