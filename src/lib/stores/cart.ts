import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface CartModifier {
	id: number;
	name: string;
	price: number;
}

export interface CartItem {
	id: number;
	name: string;
	price: number;
	quantity: number;
	note: string;
	category: string;
	image_url: string | null;
	modifiers?: CartModifier[];
}

export interface CartState {
	items: CartItem[];
	tableNumber: string | null;
	orderType: 'dine_in' | 'takeaway' | 'delivery';
	customerName: string;
	customerPhone: string;
	discountPercent: number;
	discountAmount: number;
	notes: string;
}

const STORAGE_KEY = 'pos_cart';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function loadPersistedCart(): Partial<CartState> {
	if (!browser) return {};
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return {};
	try {
		return JSON.parse(raw) as Partial<CartState>;
	} catch {
		return {};
	}
}

function persistCart(state: CartState): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

function createCartStore() {
	const persisted = loadPersistedCart();

	const { subscribe, set, update } = writable<CartState>({
		items: [],
		tableNumber: null,
		orderType: 'dine_in',
		customerName: '',
		customerPhone: '',
		discountPercent: 0,
		discountAmount: 0,
		notes: '',
		...persisted
	});

	return {
		subscribe,

		addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
			update((state) => {
				const existing = state.items.find((i) => i.id === item.id);
				if (existing) {
					existing.quantity += quantity;
				} else {
					state.items.push({ ...item, quantity, note: '', modifiers: [] });
				}
				persistCart(state);
				return state;
			});
		},

		removeItem(itemId: number): void {
			update((state) => {
				state.items = state.items.filter((i) => i.id !== itemId);
				persistCart(state);
				return state;
			});
		},

		updateQuantity(itemId: number, quantity: number): void {
			update((state) => {
				const item = state.items.find((i) => i.id === itemId);
				if (item) {
					if (quantity <= 0) {
						state.items = state.items.filter((i) => i.id !== itemId);
					} else {
						item.quantity = quantity;
					}
				}
				persistCart(state);
				return state;
			});
		},

		incrementQuantity(itemId: number): void {
			update((state) => {
				const item = state.items.find((i) => i.id === itemId);
				if (item) item.quantity += 1;
				persistCart(state);
				return state;
			});
		},

		decrementQuantity(itemId: number): void {
			update((state) => {
				const item = state.items.find((i) => i.id === itemId);
				if (item) {
					item.quantity -= 1;
					if (item.quantity <= 0) {
						state.items = state.items.filter((i) => i.id !== itemId);
					}
				}
				persistCart(state);
				return state;
			});
		}
	};
}

export const cartStore = createCartStore();

// ──────────────────────────────────────────────
// Cart Setters (state-level)
// ──────────────────────────────────────────────

export function setCartTableNumber(tableNumber: string | null): void {
	cartStore.update((s) => {
		s.tableNumber = tableNumber;
		persistCart(s);
		return s;
	});
}

export function setCartOrderType(orderType: CartState['orderType']): void {
	cartStore.update((s) => {
		s.orderType = orderType;
		persistCart(s);
		return s;
	});
}

export function setCartCustomerInfo(name: string, phone: string): void {
	cartStore.update((s) => {
		s.customerName = name;
		s.customerPhone = phone;
		persistCart(s);
		return s;
	});
}

export function setCartDiscountPercent(percent: number): void {
	cartStore.update((s) => {
		s.discountPercent = Math.max(0, Math.min(100, percent));
		persistCart(s);
		return s;
	});
}

export function setCartDiscountAmount(amount: number): void {
	cartStore.update((s) => {
		s.discountAmount = Math.max(0, amount);
		persistCart(s);
		return s;
	});
}

export function setCartNotes(notes: string): void {
	cartStore.update((s) => {
		s.notes = notes;
		persistCart(s);
		return s;
	});
}

export function clearCart(): void {
	cartStore.set({
		items: [],
		tableNumber: null,
		orderType: 'dine_in',
		customerName: '',
		customerPhone: '',
		discountPercent: 0,
		discountAmount: 0,
		notes: ''
	});
	if (browser) localStorage.removeItem(STORAGE_KEY);
}

// ──────────────────────────────────────────────
// Derived Calculations
// ──────────────────────────────────────────────

/** Total number of items in cart */
export const cartItemCount = derived(cartStore, ($cart) =>
	$cart.items.reduce((sum, item) => sum + item.quantity, 0)
);

/** Subtotal = Σ (price × quantity) */
export const cartSubtotal = derived(cartStore, ($cart) =>
	$cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

/** Total modifiers cost */
export const cartModifierTotal = derived(cartStore, ($cart) =>
	$cart.items.reduce((sum, item) => {
		const modCost = (item.modifiers ?? []).reduce((m, mod) => m + mod.price, 0);
		return sum + modCost * item.quantity;
	}, 0)
);

/** Gross total = subtotal + modifiers */
export const cartGrossTotal = derived([cartSubtotal, cartModifierTotal], ([$sub, $mod]) => $sub + $mod);

/** Discount from percentage */
export const cartDiscountFromPercent = derived([cartGrossTotal, cartStore], ([$gross, $cart]) => {
	if ($cart.discountPercent <= 0) return 0;
	return Math.round($gross * ($cart.discountPercent / 100));
});

/** Effective discount (prefer % over flat) */
export const cartDiscount = derived([cartDiscountFromPercent, cartStore], ([$pct, $cart]) =>
	$cart.discountPercent > 0 ? $pct : $cart.discountAmount
);

/** Grand total after discount */
export const cartGrandTotal = derived([cartGrossTotal, cartDiscount], ([$gross, $disc]) =>
	Math.max(0, $gross - $disc)
);
