import type { UseFetchOptions } from 'nuxt/app';
import { defu } from 'defu';

export async function useFetchDataApi<T>(
  url: string,
  options: UseFetchOptions<T> = {}
) {
  const accessToken = useCookie('accessToken');
  const { authenticated } = storeToRefs(useLoginStore());
  const config = useRuntimeConfig();
  
  const defaults = {
    baseURL: config.public.apiEndPoint,
    key: url,
    headers: accessToken.value
      ? {
          Authorization: `Bearer ${accessToken.value}`,
        }
      : {},
  };

  const params = defu(options, defaults);

  try {
    const response = await $fetch<T>(url, params as any);
    return { data: ref(response) };
  } catch (error: any) {
    const status = error.response?.status;
    if (status === 400 || status === 401 || status === 500) {
      authenticated.value = false;
      navigateTo({ name: 'login' });
    }
    throw error;
  }
}
