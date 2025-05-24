export const getBaseURL = () => {
    const config = useRuntimeConfig();
    return config.public.baseURL;
}