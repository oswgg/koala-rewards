import { useQuery } from '@tanstack/react-query';
import { customerMembershipRepository } from '../repositories/customer-membership.factory';

export function useHasMembershipByProgramPublicId(
    programPublicId: string | undefined,
    userId: string | undefined
) {
    const query = useQuery({
        queryKey: ['membership', 'byPublicId', programPublicId, userId],
        queryFn: () =>
            customerMembershipRepository.hasMembershipByProgramPublicId(
                programPublicId!,
                userId!
            ),
        enabled: !!programPublicId && !!userId,
        networkMode: 'always',
    });

    return {
        hasMembership: query.data ?? false,
        isLoading: query.isLoading,
        isFetched: query.isFetched,
        refetch: query.refetch,
    };
}
