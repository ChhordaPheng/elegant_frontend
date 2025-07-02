import type { SiteInfo, SiteInfoResponse } from "~/types/site_info/site_info";

export const useSiteInfoStore = defineStore('useSiteInfoStore', {
    state: () => ({
        loading: false,
        site_info: {} as SiteInfo,
    }),
    actions: {
        async fetchSiteInfo() {
            try {
                this.loading = true;
                const baseURL = getBaseURL();
                const response = await useFetchDataApi<SiteInfoResponse>('/site-info');
                const siteInfo = response.data?.value?.data;

                if (siteInfo) {
                    this.site_info = {
                        id: siteInfo.id,
                        site_name: siteInfo.site_name,
                        site_description: siteInfo.site_description,
                        site_logo: siteInfo.site_logo ?? '',
                        created_at: siteInfo.created_at,
                        updated_at: siteInfo.updated_at,
                    };
                    return siteInfo;
                } else {
                    throw new Error('Site info not found in response');
                }
            } catch (error) {
                console.error('Error fetching site info:', error);
                throw new Error('Could not load site information.');
            } finally {
                this.loading = false;
            }
        },
    },
})

