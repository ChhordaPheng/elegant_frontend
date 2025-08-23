export default defineNuxtRouteMiddleware((to, from) => {
    const { authenticated } = storeToRefs(useLoginStore());
    const token = useCookie('accessToken');

    // Set authenticated state if token exists
    if (token.value) {
        authenticated.value = true;
    }

    // Define routes
    const protectedRoutes = [
        'my-account',
    ];

    const publicRoutes = [
        'login',
        'register',
    ];

    // Normalize route name & path
    const routeName = typeof to.name === 'string' ? to.name : '';
    const routePath = to.path || '';

    // Does this route require authentication?
    const requiresAuth = protectedRoutes.some(route =>
        routeName.includes(route) || routePath.includes(route)
    );

    // Case 1: Authenticated user trying to access login/register → send home
    if (token.value && publicRoutes.includes(routeName)) {
        return navigateTo('/');
    }

    // Case 2: Unauthenticated user trying to access protected routes → send login
    if (!token.value && requiresAuth) {
        return navigateTo('/login');
    }

    // Otherwise → allow access
});
