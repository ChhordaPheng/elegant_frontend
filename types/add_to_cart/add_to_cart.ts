/// add to cart
export interface AddToCartRequest {
    item_variant_id: string;
    quantity: number;
}

export interface AddToCartResponse {
    status: string;
    message: string;
    data: {
        cart_id: string;
        cart_item: CartItem;
    };
}

export interface CartItem {
    cart_item_id: string;
    id: string;
    quantity: number;
    original_price: string;
    final_price: string;
    original_total_price: number;
    total_price: number;
    item_variant: ItemVariant;
    has_discount: boolean;
    discount_amount: number;
}

export interface ItemVariant {
    id: string;
    item_id: string;
    color_id: string;
    size_id: string;
    image: string;
    quantity: number;
    price: string;
    created_at: string;
    updated_at: string;
    final_price: string;
    item: Item;
    color: Color;
    size: Size;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    category_id: string;
    season_id: string;
    brand_id: string;
    discount_id: string | null;
    created_at: string;
    updated_at: string;
    discount: any | null;
}

export interface Color {
    id: string;
    name: string;
    hex_code: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface Size {
    id: string;
    name: string;
    order: number;
    description: string;
    size_group_id: string;
    created_at: string;
    updated_at: string;
}

//// get cart

export interface CartResponse {
    status: string;
    message: string;
    data: CartData;
}

export interface CartData {
    cart_id: string;
    items: CartItem[];
    total_amount: number;
    original_total_amount: number;
    total_savings: number;
    items_count: number;
    total_quantity: number;
}

export interface CartItem {
    cart_item_id: string;
    quantity: number;
    original_price: string;
    final_price: string;
    original_total_price: number;
    total_price: number;
    item_variant: ItemVariant;
    has_discount: boolean;
    discount_amount: number;
}

export interface ItemVariant {
    id: string;
    item_id: string;
    color_id: string;
    size_id: string;
    image: string;
    quantity: number;
    price: string;
    final_price: string;
    created_at: string;
    updated_at: string;
    item: Item;
    color: Color;
    size: Size;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    category_id: string;
    season_id: string;
    brand_id: string;
    discount_id: string | null;
    created_at: string;
    updated_at: string;
    discount: any; // Replace `any` with appropriate type if discount structure is known
}

export interface Color {
    id: string;
    name: string;
    hex_code: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface Size {
    id: string;
    name: string;
    order: number;
    description: string;
    size_group_id: string;
    created_at: string;
    updated_at: string;
}

// delete cart 

export interface DeleteCartResponse {
    status: string;
    message: string;
}

// update 

export interface UpdateCartItemRequest {
    item_variant_id: string;
    quantity: number;
}

export interface UpdateCartItemResponse {
    status: string;
    message: string;
    data: {
        cart_item: CartItem;
    };
}