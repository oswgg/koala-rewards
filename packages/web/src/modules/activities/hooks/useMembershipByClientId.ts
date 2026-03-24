'use client';

import { useQuery } from '@tanstack/react-query';
import { membershipService } from '@/modules/memberships/services/implementation.membership-service';

/**
 * Resolves a membership by program_public_id and customer profile id (`profiles.id`).
 * Creates the membership if it does not exist (staff scan flow).
 */
export function useMembershipByClientId(
    programPublicId: string | undefined,
    profileId: string | undefined
) {
    return useQuery({
        queryKey: ['membership', 'programProfile', programPublicId, profileId],
        queryFn: async () => {
            const existing = await membershipService.getByProgramPublicIdAndProfileId(
                programPublicId!,
                profileId!
            );
            if (existing) return existing;
            return membershipService.createByProgramPublicIdAndProfileId(
                programPublicId!,
                profileId!
            );
        },
        enabled: !!programPublicId && !!profileId,
    });
}
