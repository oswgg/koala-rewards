'use client';

import { useQuery } from '@tanstack/react-query';
import { membershipService } from '@/modules/memberships/services/implementation.membership-service';

/**
 * Resolves a membership by program_public_id and user_id.
 * Creates the membership if it does not exist.
 */
export function useMembershipByClientId(
    programPublicId: string | undefined,
    userId: string | undefined
) {
    return useQuery({
        queryKey: ['membership', 'programUser', programPublicId, userId],
        queryFn: async () => {
            const existing = await membershipService.getByProgramPublicIdAndUserId(
                programPublicId!,
                userId!
            );
            if (existing) return existing;
            return membershipService.createByProgramPublicIdAndUserId(programPublicId!, userId!);
        },
        enabled: !!programPublicId && !!userId,
    });
}
