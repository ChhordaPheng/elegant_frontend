export interface ColorResponse {
    success: boolean;
    message: string;
    status_code: number;
    data: Color[];
}

export interface Color {
    id: string;
    name: string;
    hex_code: string;
    description: string;
}