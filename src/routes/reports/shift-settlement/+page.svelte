<script lang="ts">
    import { getShiftSettlement, type ShiftSettlement } from '$lib/services/reports';

    let date = new Date().toISOString().split('T')[0];
    let userId = '';
    let data: ShiftSettlement[] = [];
    let loading = false;

    async function fetchData() {
        loading = true;
        const res = await getShiftSettlement(userId || null, date);
        data = res.data;
        loading = false;
    }
</script>

<div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Shift Settlement</h1>
    <div class="flex gap-4 mb-6">
        <input type="date" bind:value={date} class="border p-2 rounded" />
        <input type="text" bind:value={userId} placeholder="Cashier ID" class="border p-2 rounded" />
        <button on:click={fetchData} class="bg-blue-600 text-white px-4 py-2 rounded">Filter</button>
    </div>

    <table class="w-full border-collapse">
        <thead>
            <tr><th class="border p-2">Cashier</th><th class="border p-2">Transactions</th><th class="border p-2">Revenue</th></tr>
        </thead>
        <tbody>
            {#each data as item}
            <tr>
                <td class="border p-2">{item.cashier_name}</td>
                <td class="border p-2">{item.total_transactions}</td>
                <td class="border p-2">{item.total_revenue}</td>
            </tr>
            {/each}
        </tbody>
    </table>
</div>
