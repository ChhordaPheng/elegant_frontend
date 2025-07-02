export interface SiteInfo {
    id: number;
    site_name: string;
    site_description: string;
    site_logo: string;
    created_at: string;
    updated_at: string;
}

export interface SiteInfoResponse {
    data: SiteInfo;
}
