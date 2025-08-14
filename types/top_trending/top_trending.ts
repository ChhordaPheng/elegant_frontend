export interface TopTrendingResponse {
  success: boolean;
  message: string;
  status_code: number;
  top_trending: number;
  data: TopTrending[];
}

export interface TopTrending {
  id: string;
  name: string;
  description: string;
  total_sold: number;
  popularity_score: string;
  last_sale_at: string;
  recent_sales_count: number;
  views_count: number;
  trending_updated_at: string;
  is_favorite: boolean;
  category_id: string;
  season_id: string;
  brand_id: string;
  discount_id: string | null;
  created_at: string;
  updated_at: string;
  variants: Variant[];
  brand: Brand;
  category: Category;
  reviews: Review[];
  season: Season;
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
  discount_id: string | null;
  final_price: string;
  is_favorite: boolean;
  color: Color;
  size: Size;
  item: ItemBase;
}

export interface ItemBase {
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
  discount: any;
  created_at: string;
  updated_at: string;
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
