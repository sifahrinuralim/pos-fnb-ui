<script lang="ts">
    import { goto } from '$app/navigation';
    import { createPayment } from '$lib/api/payments';
    import { ordersStore } from '$lib/stores/orders';
    import { onMount } from 'svelte';

    let method: 'cash' | 'qris' | 'card' = 'cash';
    let amount = 0;
    let loading = false;
    let error = '';

    $: order = $ordersStore.activeOrder;
    $: if (order) amount = order.total;

    async function handleProcessPayment() {
        if (!order) return;
        loading = true;
        error = '';
        
        try {
            const res = await createPayment({
                order_id: order.id,
                amount,
                method
            });
            
            if (res.success) {
                // Update order status to completed
                ordersStore.updateStatus(order.id, 'completed');
                goto('/pos/orders');
            }
        } catch (e: any) {
            error = e.message || 'Payment failed';
        } finally {
            loading = false;
        }
    }
</script>

<div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Pembayaran</h1>
    
    {#if order}
        <div class="bg-white p-6 rounded shadow mb-6">
            <h2 class="font-semibold mb-2">Ringkasan Order #{order.id}</h2>
            <div class="text-4xl font-bold text-blue-600">Rp {amount.toLocaleString()}</div>
        </div>

        <div class="space-y-4">
            <div>
                <label class="block mb-2">Metode Pembayaran</label>
                <select bind:value={method} class="w-full p-2 border rounded">
                    <option value="cash">Tunai (Cash)</option>
                    <option value="qris">QRIS</option>
                    <option value="card">Kartu (Debit/Credit)</option>
                </select>
            </div>

            {#if method === 'qris'}
                <div class="p-4 bg-gray-100 rounded text-center">
                    <p class="mb-2">Scan QRIS Berikut:</p>
                    <div class="w-48 h-48 bg-white mx-auto border flex items-center justify-center">
                        [QR CODE MOCK]
                    </div>
                </div>
            {/if}

            {#if error}
                <p class="text-red-500">{error}</p>
            {/if}

            <button 
                disabled={loading}
                on:click={handleProcessPayment}
                class="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
            >
                {loading ? 'Memproses...' : 'Proses Pembayaran'}
            </button>
        </div>
    {:else}
        <p>Tidak ada order aktif.</p>
    {/if}
</div>
