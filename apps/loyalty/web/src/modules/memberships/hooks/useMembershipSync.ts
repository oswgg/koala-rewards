'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { membershipRepository } from '@/infrastructure';

export function useMembershipSync() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const sync = async () => {
            await membershipRepository.syncPending();
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
        };

        window.addEventListener('online', sync);
        if (typeof navigator !== 'undefined' && navigator.onLine) {
            sync();
        }
        return () => window.removeEventListener('online', sync);
    }, [queryClient]);
}
