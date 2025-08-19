
export interface orderResponse {
    status: string;
    message: string;
    data: Order;
}
export interface Order {
    order_id: string;
    order_number: string;
    subtotal: string;
    delivery_fee: number;
    total_amount: number;
    delivery_method: string;
    phone: string;
    status: string;
    placed_at: string;
    khqr_md5: string;
    qr_string: string;
    payment_breakdown: PaymentBreakdown;
}

export interface PaymentBreakdown {
    items_total: string;
    delivery_fee: number;
    total_to_pay: number;
}

export interface orderRequest {
    cart_id: string;
    delivery_id: string;
    payment_method: string;
    address_id: string;
    phone: string;
    note: string;
}
