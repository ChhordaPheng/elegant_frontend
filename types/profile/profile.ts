export interface UserResponse {
  data: User;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_verified: boolean;
  phone_verified: boolean;
  email_verified_at: string | null;
  phone_verified_at: string;
  otp_expires_at: string | null;
  created_at: string;
  updated_at: string;
  otp_verified_for_reset: number;
  full_name: string;
  addresses: any[];
  orders: any[];
}

////  change password 
export interface ChangePasswordRequest {
  current_password: string;
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  status_code: number;
}

/// add address 
export interface AddressRequest {
  name: string;
  home: string;
  street: string;
  city: string;
  country: string;
}

export interface AddressResponse {
  success: boolean;
  message: string;
  data: Address;
}
export interface Address {
  name: string;
  home: string;
  street: string;
  city: string;
  country: string;
  id: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
}


// get address 
export interface GetAddressResponse {
  success: boolean;
  message: string;
  data: Address[];
}

export interface DeleteAddressResponse {
  success: boolean;
  message: string;
}