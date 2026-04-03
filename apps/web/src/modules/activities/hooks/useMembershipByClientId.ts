'use client';

import { membershipRepository } from '@/infrastructure';
import { useQuery } from '@tanstack/react-query';

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
            const existing = await membershipRepository.getByProgramPublicIdAndProfileId(
                programPublicId!,
                profileId!
            );
            if (existing) return existing;
            return membershipRepository.createByProgramPublicIdAndProfileId(
                programPublicId!,
                profileId!
            );
        },
        enabled: !!programPublicId && !!profileId,
    });
}
