'use client';

import { useQuery } from '@tanstack/react-query';
import { membershipService } from '@/modules/memberships/services/implementation.membership-service';
import type { MembershipWithProgram } from '@/modules/memberships/services/interface.membership-service';

export function useMembershipByPublicId(publicId: string | undefined) {
    return useQuery({
        queryKey: ['membership', 'publicId', publicId],
        queryFn: (): Promise<MembershipWithProgram | null> =>
            membershipService.getByPublicId(publicId!),
        enabled: !!publicId,
    });
}
