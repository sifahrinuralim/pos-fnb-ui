<script lang="ts">
    import { orderStore } from '$lib/stores/orders';
    import { onMount } from 'svelte';

    onMount(() => {
        orderStore.loadActiveOrders();
    });
</script>

<div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Active Orders</h1>
    <table class="w-full border-collapse">
        <thead>
            <tr class="border-b">
                <th class="p-2 text-left">ID</th>
                <th class="p-2 text-left">Table</th>
                <th class="p-2 text-left">Status</th>
                <th class="p-2 text-left">Total</th>
            </tr>
        </thead>
        <tbody>
            {#each $orderStore.activeOrders as order}
                <tr class="border-b hover:bg-gray-50">
                    <td class="p-2">{order.id}</td>
                    <td class="p-2">{order.table_number}</td>
                    <td class="p-2"><span class="px-2 py-1 rounded bg-yellow-100">{order.status}</span></td>
                    <td class="p-2">Rp {order.total.toLocaleString()}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
