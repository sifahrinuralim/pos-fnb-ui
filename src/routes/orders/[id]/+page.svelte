<script lang="ts">
    import { page } from '$app/stores';
    import { orderStore } from '$lib/stores/orders';
    import { onMount } from 'svelte';

    const orderId = $page.params.id;

    onMount(() => {
        if (orderId) orderStore.getOrder(orderId);
    });

    async function changeStatus(status: string) {
        if (orderId) await orderStore.updateStatus(orderId, status);
    }
</script>

{#if $orderStore.currentOrder}
    <div class="p-6">
        <h1 class="text-2xl font-bold">Order #{$orderStore.currentOrder.id}</h1>
        <div class="my-4">
            <p>Table: {$orderStore.currentOrder.table_number}</p>
            <p>Status: {$orderStore.currentOrder.status}</p>
        </div>
        
        <div class="space-x-2">
            <button on:click={() => changeStatus('in_kitchen')} class="bg-blue-500 text-white px-4 py-2 rounded">To Kitchen</button>
            <button on:click={() => changeStatus('ready')} class="bg-green-500 text-white px-4 py-2 rounded">Ready</button>
        </div>
    </div>
{:else}
    <p>Loading...</p>
{/if}
