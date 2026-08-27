<script lang="ts">
import { page } from '$app/stores';
import { Loader2, Inbox, ArrowLeft, Wallet, CheckCircle2, XCircle } from 'lucide-svelte';
import { orderStore } from '$lib/stores/orders';
import type { OrderStatus } from '$lib/api/orders';
import { userRole } from '$lib/stores/auth';

// Reaktif: saat berpindah antar detail order (id di URL berubah),
// orderId ikut berubah dan refetch otomatis dijalankan di bawah.
$: orderId = $page.params.id;

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

const nextStatuses: Partial<Record<OrderStatus, OrderStatus[]>> = {
pending: ['in_kitchen', 'cancelled'],
in_kitchen: ['ready', 'cancelled'],
ready: ['served'],
served: []
};

// ── RBAC: target status yang boleh dipilih per role ──
const allowedStatusTargets: Record<string, OrderStatus[]> = {
	admin: ['in_kitchen', 'ready', 'served', 'cancelled'],
	manager: ['in_kitchen', 'ready', 'served', 'cancelled'],
	cashier: [],
	kitchen: ['in_kitchen', 'ready'],
	waiter: ['served']
};

$: currentRole = $userRole;
$: order = $orderStore.currentOrder;
$: canPay = currentRole === 'admin' || currentRole === 'manager' || currentRole === 'cashier';
let visibleNextStatuses: OrderStatus[] = [];
let updatingStatus: OrderStatus | null = null;
$: visibleNextStatuses = order
	? (nextStatuses[order.status] ?? []).filter((status) =>
			(allowedStatusTargets[currentRole ?? ''] ?? []).includes(status)
		)
	: [];

function formatCurrency(value: number): string {
return new Intl.NumberFormat('id-ID', {
style: 'currency',
currency: 'IDR',
minimumFractionDigits: 0,
maximumFractionDigits: 0
}).format(Number(value) || 0);
}

function formatDate(value?: string): string {
if (!value) return '—';
return new Date(value).toLocaleString('id-ID', {
day: '2-digit',
month: 'short',
year: 'numeric',
hour: '2-digit',
minute: '2-digit'
});
}

// 1) Refetch otomatis saat id berubah (navigasi antar order) ATAU saat komponen
//    dibuat ulang — menjamin data selalu fresh, tidak pernah pakai cache lama.
$: if (orderId) {
	orderStore.getOrder(orderId);
}

// 2) Bersihkan order lama saat id berbeda agar tidak ada flash data pesanan lain.
$: if (orderId && $orderStore.currentOrder && $orderStore.currentOrder.id !== orderId) {
	orderStore.clearCurrentOrder();
}

async function changeStatus(status: OrderStatus): Promise<void> {
if (!orderId || updatingStatus) return;
updatingStatus = status;
try {
await orderStore.updateStatus(orderId, status);
} catch {
/* error sudah di-set di store */
} finally {
updatingStatus = null;
}
}
</script>

<svelte:head>
<title>Detail Order — POS F&B</title>
</svelte:head>

<div class="space-y-6">
<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
<div class="flex items-center gap-3">
<a href="/orders" class="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50" aria-label="Kembali ke daftar pesanan">
<ArrowLeft class="w-5 h-5" />
</a>
<div>
<h1 class="text-2xl font-bold text-gray-900">Order #{orderId?.slice(0, 8)}</h1>
<p class="text-sm text-gray-500">Detail lengkap pesanan</p>
</div>
</div>
</div>

{#if $orderStore.error}
<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
{$orderStore.error}
</div>
{/if}

{#if $orderStore.loading && !order}
<div class="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-20 text-sm text-gray-500">
<Loader2 class="w-5 h-5 animate-spin" /> Memuat detail order...
</div>
{:else if order}
<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
<div class="space-y-6 lg:col-span-2">
<!-- Item pesanan -->
<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
<div class="border-b border-gray-100 px-5 py-4">
<h2 class="text-base font-bold text-gray-900">Item Pesanan</h2>
</div>
<table class="w-full text-sm">
<thead>
<tr class="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
<th class="px-5 py-3">Menu</th>
<th class="px-5 py-3 text-center">Qty</th>
<th class="px-5 py-3 text-right">Harga</th>
<th class="px-5 py-3 text-right">Subtotal</th>
</tr>
</thead>
<tbody class="divide-y divide-gray-100">
{#each order.items as item (item.id)}
<tr>
<td class="px-5 py-3.5">
<p class="font-medium text-gray-900">{item.menu_item_name}</p>
{#if item.notes}
<p class="text-xs text-gray-500">{item.notes}</p>
{/if}
</td>
<td class="px-5 py-3.5 text-center text-gray-700">{item.quantity}</td>
<td class="px-5 py-3.5 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
<td class="px-5 py-3.5 text-right font-semibold text-gray-900">{formatCurrency(item.subtotal)}</td>
</tr>
{/each}
</tbody>
</table>
</div>

<!-- Ringkasan total -->
<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
<h2 class="mb-4 text-base font-bold text-gray-900">Ringkasan</h2>
<div class="space-y-2 text-sm">
<div class="flex items-center justify-between text-gray-600">
<span>Subtotal</span>
<span>{formatCurrency(order.subtotal_amount)}</span>
</div>
{#if order.discount_amount > 0}
<div class="flex items-center justify-between text-red-600">
<span>Diskon</span>
<span>-{formatCurrency(order.discount_amount)}</span>
</div>
{/if}
{#if order.service_charge_amount > 0}
<div class="flex items-center justify-between text-gray-600">
<span>Service Charge ({order.service_charge_rate}%)</span>
<span>{formatCurrency(order.service_charge_amount)}</span>
</div>
{/if}
{#if order.ppn_amount > 0}
<div class="flex items-center justify-between text-gray-600">
<span>PPN ({order.ppn_rate}%)</span>
<span>{formatCurrency(order.ppn_amount)}</span>
</div>
{/if}
<div class="flex items-center justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
<span>Total</span>
<span>{formatCurrency(order.total_amount)}</span>
</div>
</div>
</div>
</div>

<!-- Sidebar info & aksi -->
<div class="space-y-6">
<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
<h2 class="mb-4 text-base font-bold text-gray-900">Informasi Order</h2>
<dl class="space-y-3 text-sm">
<div class="flex items-center justify-between">
<dt class="text-gray-500">Order ID</dt>
<dd class="font-mono text-xs text-gray-900">#{order.id}</dd>
</div>
<div class="flex items-center justify-between">
<dt class="text-gray-500">Status</dt>
<dd>
<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium {statusConfig[order.status]?.badge ?? 'bg-gray-100 text-gray-700'}">
{statusConfig[order.status]?.label ?? order.status}
</span>
</dd>
</div>
<div class="flex items-center justify-between">
<dt class="text-gray-500">Tipe</dt>
<dd class="text-gray-900">{typeLabel[order.order_type] ?? order.order_type}</dd>
</div>
<div class="flex items-center justify-between">
<dt class="text-gray-500">Meja</dt>
<dd class="text-gray-900">{order.table_number ? `Meja ${order.table_number}` : '—'}</dd>
</div>
{#if order.created_at}
<div class="flex items-center justify-between">
<dt class="text-gray-500">Dibuat</dt>
<dd class="text-gray-900">{formatDate(order.created_at)}</dd>
</div>
{/if}
{#if order.notes}
<div class="border-t border-gray-100 pt-3">
<dt class="mb-1 text-gray-500">Catatan</dt>
<dd class="text-gray-900">{order.notes}</dd>
</div>
{/if}
</dl>
</div>

{#if visibleNextStatuses.length > 0}
<div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
<h2 class="mb-3 text-base font-bold text-gray-900">Perbarui Status</h2>
<div class="flex flex-col gap-2">
{#each visibleNextStatuses as status}
{#if status === 'cancelled'}
<button class="btn-danger flex w-full items-center justify-center gap-2" on:click={() => changeStatus(status)} disabled={updatingStatus !== null}>
{#if updatingStatus === status}
<Loader2 class="w-4 h-4 animate-spin" />
{:else}
<XCircle class="w-4 h-4" />
{/if}
{statusConfig[status]?.label ?? status}
</button>
{:else}
<button class="btn-primary flex w-full items-center justify-center gap-2" on:click={() => changeStatus(status)} disabled={updatingStatus !== null}>
{#if updatingStatus === status}
<Loader2 class="w-4 h-4 animate-spin" />
{:else}
<CheckCircle2 class="w-4 h-4" />
{/if}
{statusConfig[status]?.label ?? status}
</button>
{/if}
{/each}
</div>
</div>
{/if}

{#if canPay && (order.status === 'pending' || order.status === 'in_kitchen' || order.status === 'ready')}
<a href="/pos/payment?order_id={order.id}" class="btn-primary flex w-full items-center justify-center gap-2">
<Wallet class="w-4 h-4" /> Lanjut ke Pembayaran
</a>
{/if}
</div>
</div>
{:else}
<div class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-center">
<Inbox class="h-10 w-10 text-gray-300" />
<p class="mt-3 text-sm font-medium text-gray-700">Order tidak ditemukan</p>
</div>
{/if}
</div>