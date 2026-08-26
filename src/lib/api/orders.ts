import { apiGet, apiPost, apiPatch, type ApiResponse } from '$lib/services/api';

// ──────────────────────────────────────────────
// Types (aligned with pos-fnb-api-py /orders)
// ──────────────────────────────────────────────

export type OrderStatus = 'pending' | 'in_kitchen' | 'ready' | 'served' | 'cancelled';

export type OrderType = 'dine_in' | 'takeaway' | 'gofood' | 'grabfood';

export interface OrderItem {
	id: string;
	menu_item_id: string;
	menu_item_name: string;
	quantity: number;
	unit_price: number;
	subtotal: number;
	notes: string | null;
}

export interface OrderDiscount {
	discount_name: string;
	discount_code: string | null;
	discount_amount: number;
}

/** Full order detail — GET /api/v1/orders/{order_id} */
export interface Order {
	id: string;
	table_id: string | null;
	table_number: number | null;
	order_type: OrderType;
	status: OrderStatus;
	subtotal_amount: number;
	discount_amount: number;
	service_charge_rate: number;
	service_charge_amount: number;
	ppn_rate: number;
	ppn_amount: number;
	total_amount: number;
	notes: string | null;
	items: OrderItem[];
	discounts: OrderDiscount[];
	created_at?: string;
	updated_at?: string;
}

/** Active order list item — GET /api/v1/orders */
export interface OrderListItem {
	id: string;
	table_id: string | null;
	order_type: OrderType;
	status: OrderStatus;
	total_amount: number;
	notes: string | null;
}

export interface OrderItemCreate {
	menu_item_id: string;
	quantity: number;
	notes?: string | null;
	variant_ids?: string[];
	addon_ids?: string[];
}

export interface OrderCreatePayload {
	order_type: OrderType;
	table_id?: string | null;
	items: OrderItemCreate[];
	notes?: string | null;
	promo_code?: string | null;
	check_stock?: boolean;
	price_book_id?: string | null;
}

/** POST /orders response — summary dict from OrderService.create_order */
export interface OrderCreateResponse {
	id: string;
	order_type: OrderType;
	status: OrderStatus;
	price_book_id: string | null;
	subtotal_amount: number;
	discount_amount: number;
	service_charge_rate: number;
	service_charge_amount: number;
	ppn_rate: number;
	ppn_amount: number;
	total_amount: number;
	items_count: number;
	discounts_applied: number;
}

/** PATCH /orders/{id}/status response */
export interface OrderStatusUpdateResponse {
	id: string;
	status: OrderStatus;
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

/** POST /api/v1/orders — create a new order */
export async function createOrder(payload: OrderCreatePayload): Promise<ApiResponse<OrderCreateResponse>> {
	return apiPost<OrderCreateResponse>('/orders', payload);
}

/** GET /api/v1/orders?limit= — list active (pending & in_kitchen) orders */
export async function listActiveOrders(limit = 50): Promise<ApiResponse<OrderListItem[]>> {
	return apiGet<OrderListItem[]>('/orders', { limit });
}

/** GET /api/v1/orders/{order_id} — full order detail */
export async function getOrder(id: string): Promise<ApiResponse<Order>> {
	return apiGet<Order>(`/orders/${id}`);
}

/** PATCH /api/v1/orders/{order_id}/status — transition order status */
export async function updateOrderStatus(
	id: string,
	status: OrderStatus
): Promise<ApiResponse<OrderStatusUpdateResponse>> {
	return apiPatch<OrderStatusUpdateResponse>(`/orders/${id}/status`, { status });
}
