import Dexie, { type EntityTable } from 'dexie';
import type { LoyaltyProgramType } from '@/shared/types/loyalty-program';

export interface LocalMembership {
    membership_client_id: string;
    program_id: string;
    business_id: string;
    user_id: string;
    program_name: string;
    program_type: LoyaltyProgramType;
    required_quantity: number;
    balance: number;
    status: 'pending_sync' | 'synced';
    created_at: string;
}

export interface QueryCacheEntry {
    key: string;
    value: string;
}

class OfflineDatabase extends Dexie {
    localMemberships!: EntityTable<LocalMembership, 'membership_client_id'>;
    queryCache!: EntityTable<QueryCacheEntry, 'key'>;

    constructor() {
        super('koalacards-offline');
        this.version(2).stores({
            localMemberships: 'membership_client_id, status, program_id, user_id',
            queryCache: 'key',
        });
    }
}

export const offlineDb = new OfflineDatabase();
