<script lang="ts">
import { onMount } from 'svelte';
import { ClipboardList, Loader2, Inbox, RefreshCw } from 'lucide-svelte';
import { orderStore } from '$lib/stores/orders';
import type { OrderStatus } from '$lib/api/orders';

const statusConfig: Record<OrderStatus, { label: string; badge: string }> = {
pending: { label: 'Menunggu', badge: 'bg-amber-100 text-amber-700' },
in_kitchen: { label: 'Di Dapur', badge: 'bg-sky-100 text-sky-700' },
ready: { label: 'Siap', badge: 'bg-emerald-100 text-emerald-700' },
served: { label: 'Tersaji', badge: 'bg-gray-100 text-gray-700' },
cancelled: { label: 'Dibatalkan', badge: 'bg-red-100 text-red-700' }
};

const typeLabel: Record<string, string> = {
dine_in: 'Makan di Tempat',
takeaway: 'Bawa Pulang',
gofood: 'GoFood',
grabfood: 'GrabFood'
};

function formatCurrency(value: number): string {
return new Intl.NumberFormat('id-ID', {
style: 'currency',
currency: 'IDR',
minimumFractionDigits: 0,
maximumFractionDigits: 0
}).format(Number(value) || 0);
}

onMount(() => {
orderStore.loadActiveOrders();
});
</script>

<svelte:head>
<title>Pesanan Aktif — POS F&B</title>
</svelte:head>

<div class="space-y-6">
<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
<div class="flex items-center gap-3">
<div class="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-50 text-primary-600">
<ClipboardList class="w-6 h-6" />
</div>
<div>
<h1 class="text-2xl font-bold text-gray-900">Pesanan Aktif</h1>
<p class="text-sm text-gray-500">Daftar order berstatus menunggu & di dapur</p>
</div>
</div>
<button class="btn-secondary" on:click={() => orderStore.loadActiveOrders()}>
<RefreshCw class="w-4 h-4" /> Muat Ulang
</button>
</div>

{#if $orderStore.error}
<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
{$orderStore.error}
</div>
{/if}

{#if $orderStore.loading && $orderStore.activeOrders.length === 0}
<div class="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-20 text-sm text-gray-500">
<Loader2 class="w-5 h-5 animate-spin" /> Memuat pesanan...
</div>
{:else if $orderStore.activeOrders.length === 0}
<div class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-center">
<Inbox class="h-10 w-10 text-gray-300" />
<p class="mt-3 text-sm font-medium text-gray-700">Belum ada pesanan aktif</p>
</div>
{:else}
<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
<div class="overflow-x-auto">
<table class="w-full min-w-[760px] text-sm">
<thead>
<tr class="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
<th class="px-5 py-3.5">Order ID</th>
<th class="px-5 py-3.5">Tipe</th>
<th class="px-5 py-3.5">Meja</th>
<th class="px-5 py-3.5">Status</th>
<th class="px-5 py-3.5">Total</th>
<th class="px-5 py-3.5 text-right">Aksi</th>
</tr>
</thead>
<tbody class="divide-y divide-gray-100">
{#each $orderStore.activeOrders as order (order.id)}
<tr class="transition hover:bg-gray-50/70">
<td class="px-5 py-4 font-mono text-xs font-medium text-gray-900">#{order.id.slice(0, 8)}</td>
<td class="px-5 py-4 text-gray-600">{typeLabel[order.order_type] ?? order.order_type}</td>
<td class="px-5 py-4 text-gray-600">
{order.order_type === 'dine_in' && order.table_id
? `Meja #${order.table_id.slice(0, 8)}`
: '—'}
</td>
<td class="px-5 py-4">
<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium {statusConfig[order.status]?.badge ?? 'bg-gray-100 text-gray-700'}">
{statusConfig[order.status]?.label ?? order.status}
</span>
</td>
<td class="px-5 py-4 font-bold text-gray-900 tabular-nums whitespace-nowrap">
{formatCurrency(order.total_amount)}
</td>
<td class="px-5 py-4 text-right">
<a href="/orders/{order.id}" class="btn-secondary !py-1.5 text-xs">Detail</a>
</td>
</tr>
{/each}
</tbody>
</table>
</div>
</div>
{/if}
</div>