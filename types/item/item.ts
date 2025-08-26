export interface ItemResponse {
  success: boolean;
  message: string;
  status_code: number; // corrected to number
  data: Item[]; // corrected to array
  pagination: Pagination;
  filters_applied: FiltersApplied;
  filter_summary: FilterSummary;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  total_sold: number;
  last_sale_at: string | null;
  is_featured_new_arrival: boolean;
  is_featured_trending: boolean;
  featured_trending_at: string | null;
  featured_new_arrival_at: string | null;
  category_id: string;
  season_id: string;
  brand_id: string;
  discount_id: string | null;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  variants: Variant[];
  brand: Brand;
  category: Category;
  season: Season;
  reviews: unknown[]; // define if reviews have structure
}

export interface Variant {
  id: string;
  item_id: string;
  color_id: string;
  size_id: string;
  image: string;
  quantity: number;
  price: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  final_price: string;
  color: Color;
  size: Size;
  item: ItemSummary;
}

export interface ItemSummary {
  id: string;
  name: string;
  description: string;
  category_id: string;
  season_id: string;
  brand_id: string;
  discount_id: string | null;
  created_at: string;
  updated_at: string;
  discount: Discount | null;
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

export interface Discount {
  id: string;
  name: string;
  type: "percent" | "fixed";
  value: string;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date: string;
  is_active: number;
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

export interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
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

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  has_more_pages: boolean;
}

export interface FiltersApplied {
  min_price: string;
  max_price: string;
}

export interface FilterSummary {
  price_range: {
    min: string;
    max: string;
  };
}

export interface FilterParams {
  page?: number;
  per_page?: number;
  brand_id?: string;
  color_id?: string;
  size_id?: string;
  min_price?: number;
  max_price?: number;
  category_id?: string;
  sort_order?: 'asc' | 'desc';
  sort_by?: 'price' | 'name' | 'created_at';
}

// Update your interfaces to match actual API response
export interface ItemListResponse {
  status: string;
  status_code: number;
  message: string;
  data: Item[];
}

export interface SingleItemResponse {
  status: string;
  status_code: number;
  message: string;
  data: Item;
}

export interface SearchParams {
  search?: string;
  category_id?: string;
  brand_id?: string;
  min_price?: number;
  max_price?: number;
}
