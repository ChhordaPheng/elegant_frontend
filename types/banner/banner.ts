export interface Banner {
  id: string;
  title: string;
  description: string;
  discount: string;
  big_image: string;
  small_image: string;
  created_at: string;
  updated_at: string;
}

export interface BannerResponse {
  data: Banner[];
}
