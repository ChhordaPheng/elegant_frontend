export interface ItemResponse {
  status: string;
  message: string;
  data: Item;
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
  variants: Variant[];
  brand: Brand;
  category: Category;
  season: Season;
  reviews: unknown[]; // If reviews have a structure, define it
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
