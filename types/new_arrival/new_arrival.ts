export interface ItemResponse {
  new_arrival: number;
  data: Item[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category_id: string;
  season_id: string;
  brand_id: string;
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
  discount_id: string;
  final_price: string;
  color: Color;
  size: Size;
  item: ItemBase;
}

export interface ItemBase {
  id: string;
  name: string;
  description: string;
  category_id: string;
  season_id: string;
  brand_id: string;
  created_at: string;
  updated_at: string;
  discount: any; 
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
