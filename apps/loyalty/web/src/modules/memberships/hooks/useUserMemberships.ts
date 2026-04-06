import { membershipRepository } from '@/infrastructure';
import { useQuery } from '@tanstack/react-query';

export function useUserMemberships(userId: string | undefined) {
    const query = useQuery({
        queryKey: ['memberships', userId],
        queryFn: () => membershipRepository.getByUserId(userId!),
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
