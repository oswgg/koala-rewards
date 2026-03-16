import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/shared/hooks/useUser';
import { useUserMemberships } from './useUserMemberships';
import { useMembershipsRealtime } from './useMembershipsRealtime';
import { useOfflineMemberships } from './useOfflineMemberships';
import { fireCelebrationConfetti } from '@/shared/lib/confetti';
import type { MembershipWithProgram } from '../services/interface.membership-service';
import type { LocalMembership } from '@/infrastructure/dexie/offline-db';
import type { StoredLoyaltyProgram } from '@/shared/types/loyalty-program';

const NEWLY_ADDED_BADGE_DURATION_MS = 5000;
const BALANCE_CHANGED_ANIMATION_MS = 2000;

function localToMembershipWithProgram(local: LocalMembership): MembershipWithProgram {
    const business = {
        id: local.business_id,
        name: '',
        slug: '',
        created_at: '',
    };
    const program: StoredLoyaltyProgram = {
        id: local.program_id,
        business_id: local.business_id,
        public_id: local.program_id,
        created_at: local.created_at,
        is_active: true,
        name: local.program_name,
        reward_description: '',
        limit_one_per_day: false,
        type: local.program_type,
        reward_cost: local.required_quantity,
        points_percentage: null,
        cashback_percentage: null,
        business,
    } as StoredLoyaltyProgram;

    return {
        id: `local-${local.membership_client_id}`,
        program_id: local.program_id,
        user_id: local.user_id,
        membership_client_id: local.membership_client_id,
        balance: local.balance,
        created_at: local.created_at,
        public_id: '',
        business,
        program,
    };
}

export function useWalletCards() {
    const { user, isLoading: isUserLoading } = useUser();
    const queryClient = useQueryClient();
    const { memberships: userMemberships, isLoading: isMembershipsLoading } = useUserMemberships(
        user?.id
    );
    const { pendingMemberships } = useOfflineMemberships();

    const [balanceChangedId, setBalanceChangedId] = useState<string | null>(null);
    const onBalanceChange = useCallback((membershipId: string) => {
        setBalanceChangedId(membershipId);
    }, []);
    const onRedeem = useCallback(() => {
        fireCelebrationConfetti();
    }, []);
    const membershipIds = useMemo(() => userMemberships?.map((m) => m.id) ?? [], [userMemberships]);
    useMembershipsRealtime(user?.id, {
        onBalanceChange,
        onRedeem,
        membershipIds,
    });

    const [newlyAdded, setNewlyAdded] = useState<MembershipWithProgram | null>(null);

    const mergedCards = useMemo(() => {
        const serverCards = userMemberships ?? [];
        const serverClientIds = new Set(
            serverCards.map((m) => m.membership_client_id).filter(Boolean)
        );

        const localCards = (pendingMemberships ?? [])
            .filter((local) => !serverClientIds.has(local.membership_client_id))
            .map(localToMembershipWithProgram);

        return [...serverCards, ...localCards];
    }, [userMemberships, pendingMemberships]);

    const cards =
        newlyAdded && user
            ? [...mergedCards.filter((m) => m.id !== newlyAdded.id), newlyAdded]
            : mergedCards;

    const isLoading = isUserLoading || (!!user && isMembershipsLoading);

    const handleJoinSuccess = useCallback(
        (membership: MembershipWithProgram) => {
            setNewlyAdded(membership);
            queryClient.setQueryData<MembershipWithProgram[]>(['memberships', user?.id], (old) => {
                const list = old ?? [];
                if (list.some((m) => m.id === membership.id)) return list;
                return [...list, membership];
            });
            queryClient.invalidateQueries({ queryKey: ['memberships', user?.id] });
        },
        [queryClient, user?.id]
    );

    useEffect(() => {
        if (!newlyAdded) return;
        const t = setTimeout(() => setNewlyAdded(null), NEWLY_ADDED_BADGE_DURATION_MS);
        return () => clearTimeout(t);
    }, [newlyAdded]);

    useEffect(() => {
        if (!balanceChangedId) return;
        const t = setTimeout(() => setBalanceChangedId(null), BALANCE_CHANGED_ANIMATION_MS);
        return () => clearTimeout(t);
    }, [balanceChangedId]);

    return {
        cards,
        newlyAddedId: newlyAdded?.id ?? null,
        balanceChangedId,
        handleJoinSuccess,
        isLoading,
    };
}
