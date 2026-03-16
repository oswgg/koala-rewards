'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { offlineDb } from '@/infrastructure/dexie/offline-db';
import { membershipService } from '../services/implementation.membership-service';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';
import { useUser } from '@/shared/hooks/useUser';

export function useSyncMemberships() {
    const { isOnline } = useNetworkStatus();
    const { user } = useUser();
    const queryClient = useQueryClient();
    const isSyncingRef = useRef(false);

    const syncPending = useCallback(async () => {
        if (isSyncingRef.current || !user?.id) return;
        isSyncingRef.current = true;

        try {
            const pending = await offlineDb.localMemberships
                .where('status')
                .equals('pending_sync')
                .toArray();

            if (pending.length === 0) return;

            for (const local of pending) {
                try {
                    const existing = await membershipService.getByClientId(
                        local.membership_client_id,
                    );

                    if (!existing) {
                        await membershipService.createWithClientId(
                            local.program_id,
                            user.id,
                            local.membership_client_id,
                        );
                    }

                    await offlineDb.localMemberships.delete(local.membership_client_id);
                } catch (err) {
                    console.warn(
                        `Failed to sync membership ${local.membership_client_id}:`,
                        err,
                    );
                }
            }

            queryClient.invalidateQueries({ queryKey: ['memberships', user.id] });
        } finally {
            isSyncingRef.current = false;
        }
    }, [user?.id, queryClient]);

    useEffect(() => {
        if (isOnline) {
            syncPending();
        }
    }, [isOnline, syncPending]);

    return { syncPending };
}
