export interface loginTypes {
    user_name : string,
    password : string
}

export type BaseResponse<T> = {
    success: boolean;
    message: string;
    status_code: string;
    data: T;
  };
  
  export interface LoginResponse extends BaseResponse<tokenResponse> {}
  
  export type tokenResponse = {
    status: string;
    success: any;
    token: string | null;
    errors: string;
    error: string;
  }