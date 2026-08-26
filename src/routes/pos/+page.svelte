<script lang="ts">
    import { orderStore } from '$lib/stores/orders';
    import { onMount } from 'svelte';

    let cart: any[] = [];
    let selectedTable = '';
    let orderType = 'dine_in';
    
    // Mock menu - in real app would come from a store or API
    const menu = [
        { id: '1', name: 'Nasi Goreng', price: 25000 },
        { id: '2', name: 'Es Teh', price: 5000 },
    ];

    function addToCart(item: any) {
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            existing.qty += 1;
            cart = [...cart];
        } else {
            cart = [...cart, { ...item, qty: 1 }];
        }
    }

    async function handleCreateOrder() {
        await orderStore.createOrder({
            items: cart.map(i => ({ menu_id: i.id, quantity: i.qty, price: i.price })),
            table_number: parseInt(selectedTable),
            order_type: orderType
        });
        cart = [];
    }
</script>

<div class="flex h-screen overflow-hidden">
    <!-- Left: Menu -->
    <div class="flex-1 p-6 overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">Menu</h2>
        <div class="grid grid-cols-3 gap-4">
            {#each menu as item}
                <button on:click={() => addToCart(item)} class="p-4 border rounded shadow hover:bg-gray-50">
                    <p class="font-bold">{item.name}</p>
                    <p class="text-sm">Rp {item.price.toLocaleString()}</p>
                </button>
            {/each}
        </div>
    </div>

    <!-- Right: Cart -->
    <div class="w-96 border-l p-6 bg-white flex flex-col">
        <h2 class="text-xl font-bold mb-4">Current Order</h2>
        <div class="flex-1 overflow-y-auto">
            {#each cart as item}
                <div class="flex justify-between mb-2">
                    <span>{item.name} x {item.qty}</span>
                    <span>Rp {(item.price * item.qty).toLocaleString()}</span>
                </div>
            {/each}
        </div>
        <div class="border-t pt-4">
            <select bind:value={selectedTable} class="w-full p-2 border mb-2">
                <option value="">Select Table</option>
                <option value="1">Table 1</option>
                <option value="2">Table 2</option>
            </select>
            <button on:click={handleCreateOrder} class="w-full bg-blue-600 text-white py-2 rounded">
                Create Order
            </button>
        </div>
    </div>
</div>
