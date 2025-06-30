export interface loginTypes {
  phone_number: string,
  password: string
}

export type BaseResponse<T> = {
  message: string;
  token: string;
  customer: T;
};

export interface LoginResponse extends BaseResponse<tokenResponse> { }

export type tokenResponse = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_verified: boolean;
  phone_verified: boolean;
  email_verified_at: string;
  phone_verified_at: string;
  otp_expires_at: string | null;
  created_at: string;
  updated_at: string;
};