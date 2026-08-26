<script lang="ts">
    import { onMount } from 'svelte';
    import { listRecentPayments, type Payment } from '$lib/api/payments';

    let payments: Payment[] = [];
    let loading = true;

    onMount(async () => {
        try {
            const res = await listRecentPayments();
            if (res.success) {
                payments = res.data;
            }
        } finally {
            loading = false;
        }
    });
</script>

<div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Daftar Pembayaran</h1>

    {#if loading}
        <p>Memuat...</p>
    {:else}
        <table class="w-full bg-white shadow rounded">
            <thead>
                <tr class="border-b">
                    <th class="p-4 text-left">Order ID</th>
                    <th class="p-4 text-left">Amount</th>
                    <th class="p-4 text-left">Method</th>
                    <th class="p-4 text-left">Status</th>
                </tr>
            </thead>
            <tbody>
                {#each payments as p}
                    <tr class="border-b">
                        <td class="p-4">{p.order_id}</td>
                        <td class="p-4">Rp {p.amount.toLocaleString()}</td>
                        <td class="p-4 uppercase">{p.method}</td>
                        <td class="p-4"><span class="px-2 py-1 rounded text-xs {p.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}">{p.status}</span></td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>
