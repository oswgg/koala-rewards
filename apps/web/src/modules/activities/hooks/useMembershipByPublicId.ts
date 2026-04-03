'use client';

import { membershipRepository } from '@/infrastructure';
import { MembershipWithProgram } from '@koalacards/loyalty';
import { useQuery } from '@tanstack/react-query';

export function useMembershipByPublicId(publicId: string | undefined) {
    return useQuery({
        queryKey: ['membership', 'publicId', publicId],
        queryFn: (): Promise<MembershipWithProgram | null> =>
            membershipRepository.getByPublicId(publicId!),
        enabled: !!publicId,
    });
}
