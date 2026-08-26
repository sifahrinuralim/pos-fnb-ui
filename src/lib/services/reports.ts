import { apiGet } from './api';

export interface SalesSummary {
    period: string;
    total_gross_revenue: number;
    total_discount_amount: number;
    net_revenue: number;
    total_transactions: number;
    average_order_value: number;
    payment_breakdown: Array<{ method: string; total: number }>;
}

export interface BestSelling {
    menu_item_name: string;
    total_quantity_sold: number;
    total_revenue: number;
}

export interface ShiftSettlement {
    cashier_name: string;
    total_transactions: number;
    total_revenue: number;
    payment_methods: Array<{ method: string; amount: number }>;
}

export const getSalesSummary = (startDate: string, endDate: string) => 
    apiGet<SalesSummary>('/reports/sales-summary', { start_date: startDate, end_date: endDate });

export const getBestSelling = (limit: number, startDate: string, endDate: string) => 
    apiGet<BestSelling[]>('/reports/best-selling', { limit, start_date: startDate, end_date: endDate });

export const getShiftSettlement = (userId: string | null, date: string) => 
    apiGet<ShiftSettlement[]>('/reports/shift-settlement', { user_id: userId, date });
