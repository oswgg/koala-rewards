import { offlineDb } from './offline-db';

export const dexieStorage = {
    getItem: async (key: string): Promise<string | null> => {
        const entry = await offlineDb.queryCache.get(key);
        return entry?.value ?? null;
    },
    setItem: async (key: string, value: string): Promise<void> => {
        await offlineDb.queryCache.put({ key, value });
    },
    removeItem: async (key: string): Promise<void> => {
        await offlineDb.queryCache.delete(key);
    },
};
