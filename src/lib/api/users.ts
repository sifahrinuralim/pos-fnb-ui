import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '$lib/services/api';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'cashier' | 'kitchen' | 'waiter';
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export const createUser = (data: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => 
    apiPost('/v1/users', data);

export const listUsers = (skip = 0, limit = 20, is_active?: boolean): Promise<ApiResponse<{ items: User[], total: number }>> => 
    apiGet('/v1/users', { skip, limit, is_active });

export const getUser = (id: string): Promise<ApiResponse<User>> => 
    apiGet(`/v1/users/${id}`);

export const updateUser = (id: string, data: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => 
    apiPatch(`/v1/users/${id}`, data);

export const deleteUser = (id: string): Promise<ApiResponse<void>> => 
    apiDelete(`/v1/users/${id}`);
