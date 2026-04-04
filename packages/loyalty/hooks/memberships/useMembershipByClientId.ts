'use client';

import { MembershipsRepository } from '@vado/loyalty/core';
import { useQuery } from '@tanstack/react-query';

export interface UseMembershipByClientIdProps {
    membershipRepository: MembershipsRepository;
    programPublicId: string | undefined;
    profileId: string | undefined;
}

/**
 * Resolves a membership by program_public_id and customer profile id (`profiles.id`).
 * Creates the membership if it does not exist (staff scan flow).
 */
export function useMembershipByClientId({
    membershipRepository,
    programPublicId,
    profileId,
}: UseMembershipByClientIdProps) {
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
