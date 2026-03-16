import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { dexieStorage } from '@/infrastructure/dexie/dexie-storage';

const PERSIST_CACHE_KEY = 'koalacards-offline-cache';
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

export function getPersister() {
    if (typeof window === 'undefined') return null;
    return createAsyncStoragePersister({
        storage: dexieStorage,
        key: PERSIST_CACHE_KEY,
    });
}
