export interface WomenResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: Women[];
  page: number;
  per_page: number;
  total: number;
}

export interface Women {
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
  final_price: number;
  color: Color;
  size: Size;
  discount: Discount;
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
}
