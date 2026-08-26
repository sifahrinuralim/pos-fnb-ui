import { apiGet, apiPost, type ApiResponse } from '$lib/services/api';

// ──────────────────────────────────────────────
// Types (aligned with Swagger /openapi.json)
// ──────────────────────────────────────────────

export interface LoginRequest {
	email: string;
	password: string;
}

export interface AuthUser {
	id: number;
	name: string;
	email: string;
	role: string;
	permissions: string[];
	outlet_id: number | null;
	outlet_name: string | null;
}

export interface TokenResponse {
	user: AuthUser;
	access_token: string;
	refresh_token: string;
	expires_in: number;
}

export interface TokenRefreshResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
}

export interface RefreshTokenRequest {
	refresh_token: string;
}

// ──────────────────────────────────────────────
// Auth API Functions
// ──────────────────────────────────────────────

/** POST /api/v1/auth/login */
export async function login(payload: LoginRequest): Promise<ApiResponse<TokenResponse>> {
	return apiPost<TokenResponse>('/auth/login', payload);
}

/** GET /api/v1/auth/me — requires Bearer token */
export async function getMe(): Promise<ApiResponse<AuthUser>> {
	return apiGet<AuthUser>('/auth/me');
}

/** POST /api/v1/auth/logout — requires Bearer token (stateless) */
export async function logout(): Promise<ApiResponse<Record<string, never>>> {
	return apiPost<Record<string, never>>('/auth/logout');
}

/** POST /api/v1/auth/refresh */
export async function refreshToken(
	refresh_token: string
): Promise<ApiResponse<TokenRefreshResponse>> {
	return apiPost<TokenRefreshResponse>('/auth/refresh', { refresh_token });
}
