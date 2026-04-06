import { QueryClient } from '@tanstack/react-query';

const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 días

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: CACHE_MAX_AGE,
        },
        mutations: {
            retry: 0,
        },
    },
});
