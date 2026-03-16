'use client';

import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { offlineDb, type LocalMembership } from '@/infrastructure/dexie/offline-db';
import type { LoyaltyProgramType } from '@/shared/types/loyalty-program';

export interface CreateLocalMembershipInput {
    user_id: string;
    membership_client_id: string;
    program_id: string;
    business_id: string;
    program_name: string;
    program_type: LoyaltyProgramType;
    required_quantity: number;
}

export function useOfflineMemberships() {
    const pendingMemberships = useLiveQuery(
        () => offlineDb.localMemberships.where('status').equals('pending_sync').toArray(),
        [],
        [] as LocalMembership[]
    );

    const allLocalMemberships = useLiveQuery(
        () => offlineDb.localMemberships.toArray(),
        [],
        [] as LocalMembership[]
    );

    const createLocalMembership = useCallback(async (input: CreateLocalMembershipInput) => {
        const existing = await offlineDb.localMemberships.get(input.membership_client_id);
        if (existing) return existing;

        const membership: LocalMembership = {
            ...input,
            balance: 0,
            status: 'pending_sync',
            created_at: new Date().toISOString(),
        };
        await offlineDb.localMemberships.add(membership);
        return membership;
    }, []);

    const markAsSynced = useCallback(async (membershipClientId: string) => {
        await offlineDb.localMemberships.update(membershipClientId, {
            status: 'synced',
        });
    }, []);

    const removeLocal = useCallback(async (membershipClientId: string) => {
        await offlineDb.localMemberships.delete(membershipClientId);
    }, []);

    const getLocalByClientId = useCallback(async (membershipClientId: string) => {
        return offlineDb.localMemberships.get(membershipClientId) ?? null;
    }, []);

    return {
        pendingMemberships,
        allLocalMemberships,
        createLocalMembership,
        markAsSynced,
        removeLocal,
        getLocalByClientId,
    };
}
