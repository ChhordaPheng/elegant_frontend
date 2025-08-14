export interface PromotionResponse {
    success: boolean;
    status: number;
    message: string;
    data: Promotion;
}

export interface Promotion {
    id: string;
    title: string;
    description: string;
    discount_script: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
    countdown: Countdown;
}

export interface Countdown {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total_seconds: number;
}