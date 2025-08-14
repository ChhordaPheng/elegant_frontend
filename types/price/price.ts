export interface PriceResponse {
    success: boolean;
    message: string;
    status_code: number;
    data: Price;
}

export interface Price {
    min_price: number;
    max_price: number;
    avg_price: number;
    total_item: number;
}