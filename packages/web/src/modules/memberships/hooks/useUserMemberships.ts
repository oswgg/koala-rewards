import { useQuery } from '@tanstack/react-query';
import { customerMembershipRepository } from '../repositories/customer-membership.factory';

export function useUserMemberships(userId: string | undefined) {
    const query = useQuery({
        queryKey: ['memberships', userId],
        queryFn: () => customerMembershipRepository.getByUserId(userId!),
        enabled: !!userId,
        networkMode: 'always',
    });

    return {
        memberships: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
