export interface OtpRequestTypes {
    phone_number: string;
    otp_code: string;
}

export type OtpRequestResponse = {
    message: string;
    customer: Customer;
};

export type Customer = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    phone_verified: boolean;
}