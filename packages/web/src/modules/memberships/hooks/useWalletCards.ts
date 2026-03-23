import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/shared/hooks/useUser';
import { useUserMemberships } from './useUserMemberships';
import { useMembershipsRealtime } from './useMembershipsRealtime';
import { fireCelebrationConfetti } from '@/shared/lib/confetti';
import type { MembershipWithProgram } from '../services/interface.membership-service';

const NEWLY_ADDED_BADGE_DURATION_MS = 5000;
const BALANCE_CHANGED_ANIMATION_MS = 2000;

export function useWalletCards() {
    const queryClient = useQueryClient();
    const { user, isLoading: isUserLoading } = useUser();

    const [balanceChangedId, setBalanceChangedId] = useState<string | null>(null);
    const [newlyAdded, setNewlyAdded] = useState<MembershipWithProgram | null>(null);

    const { memberships: userMemberships, isLoading: isMembershipsLoading } = useUserMemberships(
        user?.id
    );
    const membershipIds = useMemo(() => userMemberships?.map((m) => m.id) ?? [], [userMemberships]);
    const onBalanceChange = useCallback((membershipId: string) => {
        setBalanceChangedId(membershipId);
    }, []);
    const onRedeem = useCallback(() => {
        fireCelebrationConfetti();
    }, []);
    useMembershipsRealtime(user?.id, {
        onBalanceChange,
        onRedeem,
        membershipIds,
    });

    const cards =
        newlyAdded && user
            ? [...(userMemberships ?? []).filter((m) => m.id !== newlyAdded.id), newlyAdded]
            : (userMemberships ?? []);

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
