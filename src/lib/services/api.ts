import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { get } from 'svelte/store';
import { authStore } from '$lib/stores/auth';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data: T;
	errors: Record<string, string[]> | null;
}

interface RefreshTokenResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
}

// ──────────────────────────────────────────────
// Axios Instance
// ──────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

const api = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	},
	timeout: 15000
});

// ──────────────────────────────────────────────
// Request Interceptor — Attach Bearer Token
// ──────────────────────────────────────────────

api.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const auth = get(authStore);
		if (auth.token) {
			config.headers.Authorization = `Bearer ${auth.token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// ──────────────────────────────────────────────
// Response Interceptor — Auto-Refresh on 401
// ──────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value: unknown) => void;
	reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null): void {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
}

api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

		// Handle 401 — attempt token refresh
		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return api(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const auth = get(authStore);

			if (!auth.refreshToken) {
				isRefreshing = false;
				authStore.logout();
				return Promise.reject(error);
			}

			try {
				const { data: responseData } = await axios.post<ApiResponse<RefreshTokenResponse>>(
					`${BASE_URL}/auth/refresh`,
					{ refresh_token: auth.refreshToken }
				);

				if (responseData.success && responseData.data) {
					const { access_token, refresh_token } = responseData.data;

					authStore.updateTokens(access_token, refresh_token);

					processQueue(null, access_token);

					originalRequest.headers.Authorization = `Bearer ${access_token}`;
					return api(originalRequest);
				}

				throw new Error('Refresh token response invalid');
			} catch (refreshError) {
				processQueue(refreshError, null);
				authStore.logout();
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		// Normalize error into ApiResponse shape
		const axiosData = error.response?.data as Partial<ApiResponse> | undefined;
		const normalizedError: ApiResponse = {
			success: false,
			message: axiosData?.message ?? error.message ?? 'Terjadi kesalahan jaringan.',
			data: (axiosData?.data as unknown) ?? null,
			errors: axiosData?.errors ?? null
		};

		return Promise.reject(normalizedError);
	}
);

// ──────────────────────────────────────────────
// Typed API Helpers
// ──────────────────────────────────────────────

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
	const { data } = await api.get<ApiResponse<T>>(url, { params });
	return data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
	const { data } = await api.post<ApiResponse<T>>(url, body);
	return data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
	const { data } = await api.put<ApiResponse<T>>(url, body);
	return data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
	const { data } = await api.patch<ApiResponse<T>>(url, body);
	return data;
}

export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
	const { data } = await api.delete<ApiResponse<T>>(url);
	return data;
}

export default api;
