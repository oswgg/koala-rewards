'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MembershipWithProgram } from '@vado/loyalty';
import { membershipActivitiesRealtimeClient } from '@/infrastructure';

export interface UseMembershipsRealtimeOptions {
    /** `profiles.id` del usuario (requerido por realtime scope CLIENT) */
    profileId?: string;
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
    const { profileId, onBalanceChange, onRedeem, membershipIds = [] } = options ?? {};

    useEffect(() => {
        if (!userId || !profileId) return;

        const subscription = membershipActivitiesRealtimeClient.subscribe(
            {
                type: 'CLIENT',
                profileId,
                membershipIds,
            },
            (event) => {
                if (event.type === 'EARN') {
                    queryClient.setQueryData<MembershipWithProgram[]>(
                        ['memberships', userId],
                        (old) => {
                            if (!old) return old;
                            return old.map((m) =>
                                m.id === event.membershipId
                                    ? { ...m, balance: event.newBalance }
                                    : m
                            );
                        }
                    );
                    onBalanceChange?.(event.membershipId);
                    return;
                }

                onRedeem?.(event.membershipId);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [userId, profileId, queryClient, onBalanceChange, onRedeem, membershipIds]);
}
