export interface DeliveryResponse {
    status: string;
    message: string;
    data: Delivery[];
}

export interface Delivery {
    id: string;
    name: string;
    delivery_fee: string;
    description: string;
    logo: string;
}