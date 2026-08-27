import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '$lib/services/api';

export type UserRole = 'admin' | 'manager' | 'cashier' | 'kitchen' | 'waiter';

/** Role display labels */
export const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Admin',
    manager: 'Manager',
    cashier: 'Cashier',
    kitchen: 'Kitchen',
    waiter: 'Waiter',
};

/** Tailwind badge colors per role */
export const ROLE_BADGE_COLORS: Record<UserRole, string> = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-purple-100 text-purple-800',
    cashier: 'bg-blue-100 text-blue-800',
    kitchen: 'bg-amber-100 text-amber-800',
    waiter: 'bg-green-100 text-green-800',
};

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ListUsersResponse {
    items: User[];
    total: number;
}

export interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    is_active?: boolean;
}

export interface UpdateUserPayload {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    is_active?: boolean;
}

/** POST /api/v1/users — Create a new user */
export const createUser = (data: CreateUserPayload): Promise<ApiResponse<User>> =>
    apiPost<User>('/users', data);

/** GET /api/v1/users?skip=&limit=&is_active= */
export const listUsers = (
    skip = 0,
    limit = 20,
    is_active?: boolean
): Promise<ApiResponse<ListUsersResponse>> =>
    apiGet<ListUsersResponse>('/users', { skip, limit, is_active });

/** GET /api/v1/users/{user_id} */
export const getUser = (id: string): Promise<ApiResponse<User>> =>
    apiGet<User>(`/users/${id}`);

/** PATCH /api/v1/users/{user_id} */
export const updateUser = (
    id: string,
    data: UpdateUserPayload
): Promise<ApiResponse<User>> =>
    apiPatch<User>(`/users/${id}`, data);

/** DELETE /api/v1/users/{user_id} */
export const deleteUser = (id: string): Promise<ApiResponse<void>> =>
    apiDelete<void>(`/users/${id}`);
