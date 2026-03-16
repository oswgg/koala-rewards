'use client';

import { useQuery } from '@tanstack/react-query';
import { membershipService } from '@/modules/memberships/services/implementation.membership-service';
import type { MembershipWithProgram } from '@/modules/memberships/services/interface.membership-service';

/**
 * Resolves a membership by membership_client_id.
 * If it doesn't exist, creates one using the provided userId.
 */
export function useMembershipByClientId(
    membershipClientId: string | undefined,
    programId: string | undefined,
    userId: string | undefined
) {
    return useQuery({
        queryKey: ['membership', 'clientId', membershipClientId],
        queryFn: async (): Promise<MembershipWithProgram | null> => {
            if (!membershipClientId || !programId || !userId) return null;

            const existing = await membershipService.getByClientId(membershipClientId);
            if (existing) return existing;

            await membershipService.createWithClientId(programId, userId, membershipClientId);

            return await membershipService.getByClientId(membershipClientId);
        },
        enabled: !!membershipClientId && !!programId && !!userId,
    });
}
