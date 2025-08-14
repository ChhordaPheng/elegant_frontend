export interface SizeResponse {
    success: boolean;
    message: string;
    status_code: number;
    data: Size[];
}

export interface Size {
    id: string;
    name: string;
    description: string;
    size_group_id: string;
    order: number;
    size_group: SizeGroup;
}

export interface SizeGroup {
    id: string;
    name: string;
}