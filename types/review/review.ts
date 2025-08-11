export interface RatingBreakdown {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ReviewItem {
  id: string;
  customer_id: string;
  item_id: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
  customer: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
}

export interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ItemInfo {
  id: string;
  name: string;
  average_rating: number;
  total_reviews: number;
  rating_breakdown: RatingBreakdown;
}

export interface ReviewsData {
  data: ReviewItem[];
  pagination: Pagination;
}

export interface ReviewResponse {
  status: string;
  message: string;
  data: {
    item: ItemInfo;
    reviews: ReviewsData;
  };
}

// add comment 

export interface ReviewRequest {
  item_id: string;
  rating: string;
  comment: string;
}

export interface ReviewSubmitResponse {
  status: string;
  message: string;
  data: ReviewItemFull;
}

export interface ReviewItemFull {
  id: string;
  customer_id: string;
  item_id: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  reviewed_at: string;
  updated_at: string;
  created_at: string;
  customer: Customer;
  item: Item;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface Item {
  id: string;
  name: string;
}
