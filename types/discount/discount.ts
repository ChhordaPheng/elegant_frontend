export interface Discount {
  id: string;
  name: string;
  description: string;
  type: "percent" | "fixed";
  value: string;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface DiscountInfo {
  type: "percent" | "fixed";
  value: string;
  savings: number;
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

export interface Item {
  id: string;
  name: string;
  description: string;
  total_sold: number;
  popularity_score: string;
  last_sale_at: string;
  recent_sales_count: number;
  views_count: number;
  trending_updated_at: string;
  category_id: string;
  season_id: string;
  brand_id: string;
  discount_id: string;
  created_at: string;
  updated_at: string;
  discount: Discount;
}

export interface Variant {
  id: string;
  item_id: string;
  color_id: string;
  size_id: string;
  image: string;
  quantity: number;
  price: string;
  original_price: string;
  discounted_price: number;
  final_price: number;
  discount_info: DiscountInfo;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  color: Color;
  size: Size;
  item: Item;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  is_featured: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_group_id: string;
  created_at: string;
  updated_at: string;
  group: CategoryGroup;
}

export interface Season {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DataItem {
  id: string;
  name: string;
  description: string;
  total_sold: number;
  popularity_score: string;
  last_sale_at: string;
  recent_sales_count: number;
  views_count: number;
  trending_updated_at: string;
  category_id: string;
  season_id: string;
  brand_id: string;
  discount_id: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  discount_details: Discount;
  variants: Variant[];
  brand: Brand;
  category: Category;
  season: Season;
  discount: Discount;
  reviews: any[]; // can define a Review interface if needed
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  has_more_pages: boolean;
}

export interface DiscountedItemsResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: DataItem[];
  pagination: Pagination;
  filters_applied: any[];
  filter_summary: any[];
}
