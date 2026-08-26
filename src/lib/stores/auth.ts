import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import * as authApi from '$lib/api/auth.api';
import type { ApiResponse } from '$lib/services/api';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type { AuthUser } from '$lib/api/auth.api';

export interface AuthState {
	user: authApi.AuthUser | null;
	token: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	loading: boolean;
}

const STORAGE_KEY_TOKEN = 'pos_token';
const STORAGE_KEY_REFRESH = 'pos_refresh_token';
const STORAGE_KEY_USER = 'pos_user';

// ──────────────────────────────────────────────
// Helpers — localStorage persistence
// ──────────────────────────────────────────────

function loadPersistedAuth(): Partial<AuthState> {
	if (!browser) return {};

	const token = localStorage.getItem(STORAGE_KEY_TOKEN);
	const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH);
	const userJson = localStorage.getItem(STORAGE_KEY_USER);

	let user: authApi.AuthUser | null = null;
	try {
		user = userJson ? JSON.parse(userJson) : null;
	} catch {
		user = null;
	}

	if (token && user) {
		return { token, refreshToken, user, isAuthenticated: true };
	}
	return {};
}

function persistAuth(state: AuthState): void {
	if (!browser) return;

	if (state.isAuthenticated && state.token && state.user) {
		localStorage.setItem(STORAGE_KEY_TOKEN, state.token);
		if (state.refreshToken) localStorage.setItem(STORAGE_KEY_REFRESH, state.refreshToken);
		localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(state.user));
	} else {
		localStorage.removeItem(STORAGE_KEY_TOKEN);
		localStorage.removeItem(STORAGE_KEY_REFRESH);
		localStorage.removeItem(STORAGE_KEY_USER);
	}
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

function createAuthStore() {
	const persisted = loadPersistedAuth();

	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		token: null,
		refreshToken: null,
		isAuthenticated: false,
		loading: false,
		...persisted
	});

	return {
		subscribe,

		/** Authenticate user with email & password */
		async login(payload: authApi.LoginRequest): Promise<ApiResponse<authApi.TokenResponse>> {
			update((s) => ({ ...s, loading: true }));

			try {
				const response = await authApi.login(payload);

				if (response.success && response.data) {
					const { user, access_token, refresh_token } = response.data;

					const newState: AuthState = {
						user,
						token: access_token,
						refreshToken: refresh_token,
						isAuthenticated: true,
						loading: false
					};

					set(newState);
					persistAuth(newState);
				}

				return response;
			} catch (error) {
				update((s) => ({ ...s, loading: false }));
				throw error;
			}
		},

		/** Fetch current user profile from API (GET /auth/me) */
		async getMe(): Promise<ApiResponse<authApi.AuthUser>> {
			update((s) => ({ ...s, loading: true }));

			try {
				const response = await authApi.getMe();

				if (response.success && response.data) {
					update((s) => {
						const newState = { ...s, user: response.data, loading: false };
						persistAuth(newState);
						return newState;
					});
				}

				return response;
			} catch (error) {
				update((s) => ({ ...s, loading: false }));
				throw error;
			}
		},

		/** Update tokens (used by refresh interceptor) */
		updateTokens(token: string, refreshToken: string): void {
			update((s) => {
				const newState = { ...s, token, refreshToken };
				persistAuth(newState);
				return newState;
			});
		},

		/** Update user profile data */
		setUser(user: authApi.AuthUser): void {
			update((s) => {
				const newState = { ...s, user };
				persistAuth(newState);
				return newState;
			});
		},

		/** Call logout API then clear all auth state */
		async logout(): Promise<void> {
			// Best-effort call to backend to invalidate (stateless but clean)
			try {
				await authApi.logout();
			} catch {
				// Token may already be expired — proceed with local cleanup anyway
			}

			const emptyState: AuthState = {
				user: null,
				token: null,
				refreshToken: null,
				isAuthenticated: false,
				loading: false
			};
			set(emptyState);
			persistAuth(emptyState);

			if (browser) {
				window.location.href = '/login';
			}
		}
	};
}

export const authStore = createAuthStore();

// ──────────────────────────────────────────────
// Derived Stores
// ──────────────────────────────────────────────

/** Current authenticated user (null when not logged in) */
export const currentUser = derived(authStore, ($auth) => $auth.user);

/** User role string */
export const userRole = derived(authStore, ($auth) => $auth.user?.role ?? null);

/** User permissions array */
export const userPermissions = derived(authStore, ($auth) => $auth.user?.permissions ?? []);

/**
 * Check if user has a specific permission.
 * Usage: import { hasPermission } from '$lib/stores/auth';
 *        $hasPermission('order.create')
 */
export const hasPermission = derived(userPermissions, ($perms) => {
	return (permission: string): boolean => $perms.includes(permission);
});

/**
 * Check if user has a specific role.
 * Usage: import { hasRole } from '$lib/stores/auth';
 *        $hasRole('admin')
 */
export const hasRole = derived(userRole, ($role) => {
	return (role: string): boolean => $role === role;
});
