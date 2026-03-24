import { useQuery } from '@tanstack/react-query';
import { customerMembershipRepository } from '../repositories/customer-membership.factory';

export function useHasMembership(programId: string | undefined, userId: string | undefined) {
    const query = useQuery({
        queryKey: ['membership', programId, userId],
        queryFn: () =>
            customerMembershipRepository.hasMembership(programId!, userId!),
        enabled: !!programId && !!userId,
        networkMode: 'always',
    });

    return {
        hasMembership: query.data ?? false,
        isLoading: query.isLoading,
        refetch: query.refetch,
    };
}
