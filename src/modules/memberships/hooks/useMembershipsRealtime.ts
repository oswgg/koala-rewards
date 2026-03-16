'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { membershipsRealtimeService } from '../services/implementation.memberships-realtime-service';
import type { MembershipWithProgram } from '../services/interface.membership-service';

export interface UseMembershipsRealtimeOptions {
    /** Se llama cuando cambia el balance (para animaciones) */
    onBalanceChange?: (membershipId: string) => void;
    /** Se llama cuando el cliente canjea una recompensa (para celebración) */
    onRedeem?: (membershipId: string) => void;
    /** IDs de membresías del usuario (para filtrar eventos de redeem) */
    membershipIds?: string[];
}

/**
 * Suscripción a cambios en tiempo real del balance de las membresías del usuario
 * y a canjes de recompensa (card_activity tipo redeem).
 */
export function useMembershipsRealtime(
    userId: string | undefined,
    options?: UseMembershipsRealtimeOptions
) {
    const queryClient = useQueryClient();
    const { onBalanceChange, onRedeem, membershipIds = [] } = options ?? {};

    useEffect(() => {
        if (!userId) return;

        const unsubscribe = membershipsRealtimeService.subscribe(userId, {
            onBalanceChange: (membershipId, newBalance) => {
                queryClient.setQueryData<MembershipWithProgram[]>(
                    ['memberships', userId],
                    (old) => {
                        if (!old) return old;
                        return old.map((m) =>
                            m.id === membershipId ? { ...m, balance: newBalance } : m
                        );
                    }
                );
                onBalanceChange?.(membershipId);
            },
            onRedeem,
            membershipIds,
        });

        return unsubscribe;
    }, [userId, queryClient, onBalanceChange, onRedeem, membershipIds]);
}
