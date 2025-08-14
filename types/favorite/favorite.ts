export interface FavoriteResponse {
    success: boolean;
    message: string;
    status_code: number;
    data: {
        favorites: Favorite[];
        pagination: Pagination;
    };
}

export interface Favorite {
    id: string;
    added_at: string;
    is_favorite: boolean;
    item_variant: ItemVariant;
}

export interface ItemVariant {
    id: string;
    price: string;
    final_price: string;
    quantity: number;
    image: string;
    is_favorite: boolean;
}

export interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more_pages: boolean;
}

/// add to favorite 

export interface AddToFavRequest {
    item_variant_id: string;
}

export interface AddToFavResponse {
    success: boolean;
    message: string;
    status_code: number;
    data: AddToFav;
}

export interface AddToFav {
    id: string;
    price: string;
    final_price: string;
    quantity: number;
    image: string;
    is_favorite: boolean;
}

// delete the favorite 

export interface DeleteFavResponse {
    success: boolean;
    message: string;
    status: number;
}