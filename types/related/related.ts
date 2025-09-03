export interface RelatedResponse {
  success: boolean;
  message: string;
  status_code: number; // corrected to number
  data: Related[]; // corrected to array
  meta: Meta;
}

export interface Related {
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
  reviews: Review[]; // define if reviews have structure
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

export interface Review {
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

export interface Meta {
  total_found: number;
  requested_limit: number;
  base_item: BaseItem;
}

export interface BaseItem {
  id: string;
  name: string;
  category: string;
  brand: string;
}