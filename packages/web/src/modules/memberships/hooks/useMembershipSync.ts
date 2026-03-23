'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { customerMembershipRepository } from '../repositories/customer-membership.factory';

export function useMembershipSync() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const sync = async () => {
            await customerMembershipRepository.syncPending();
            queryClient.invalidateQueries({ queryKey: ['memberships'] });
        };

        window.addEventListener('online', sync);
        if (typeof navigator !== 'undefined' && navigator.onLine) {
            sync();
        }
        return () => window.removeEventListener('online', sync);
    }, [queryClient]);
}
