export interface CategoryResponse {
    success: boolean;
    message: string;
    status_code: number;
    data: Category[];
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    group: Group;
}

export interface Group {
    id: number;
    name: string;
    slug: string;
}