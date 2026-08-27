import { get } from 'svelte/store';
import { userRole } from '$lib/stores/auth';

// ──────────────────────────────────────────────
// Role Definitions & Permissions
// ──────────────────────────────────────────────

export type AppRole = 'admin' | 'manager' | 'cashier' | 'kitchen' | 'waiter';

/** Feature keys used for fine-grained access control */
export type Feature =
	| 'users'
	| 'settings'
	| 'inventory'
	| 'reports'
	| 'menu_items'
	| 'categories'
	| 'tables'
	| 'discounts'
	| 'orders'
	| 'payments'
	| 'pos';

/** Route path prefixes each role is allowed to access */
export const roleRoutes: Record<AppRole, string[]> = {
	admin: ['/'], // admin has access to everything
	manager: ['/'],
	cashier: ['/pos', '/orders', '/payments', '/customers'],
	kitchen: ['/orders'],
	waiter: ['/orders']
};

/** Feature-level permissions per role */
const roleFeatures: Record<AppRole, Feature[]> = {
	admin: ['users', 'settings', 'inventory', 'reports', 'menu_items', 'categories', 'tables', 'discounts', 'orders', 'payments', 'pos'],
	manager: ['settings', 'inventory', 'reports', 'menu_items', 'categories', 'tables', 'discounts', 'orders', 'payments', 'pos'],
	cashier: ['orders', 'payments', 'pos'],
	kitchen: ['orders'],
	waiter: ['orders']
};

/** Roles that can manage user CRUD */
const USER_MANAGEMENT_ROLES: AppRole[] = ['admin'];

// ──────────────────────────────────────────────
// Guard Functions
// ──────────────────────────────────────────────

/**
 * Check if the current user's role is within the allowed list.
 * Usage: canAccess(['admin', 'manager'])
 */
export function canAccess(allowedRoles: string[]): boolean {
	const role = get(userRole) as AppRole | null;
	return !!role && allowedRoles.includes(role);
}

/**
 * Check if the current user has access to a specific feature.
 * Usage: canAccessFeature('users')
 */
export function canAccessFeature(feature: Feature): boolean {
	const role = get(userRole) as AppRole | null;
	if (!role) return false;
	return roleFeatures[role]?.includes(feature) ?? false;
}

/**
 * Check if the current user can manage users (create/edit/delete).
 * Only admin has this permission.
 */
export function canManageUsers(): boolean {
	return canAccess(USER_MANAGEMENT_ROLES);
}

/**
 * Get the current user's role, or null if not authenticated.
 */
export function getCurrentRole(): AppRole | null {
	return (get(userRole) as AppRole | null) ?? null;
}

/**
 * Sidebar visibility check — determines whether a nav item
 * should be shown based on the user's role.
 */
export function canSeeNavItem(feature: Feature): boolean {
	return canAccessFeature(feature);
}

