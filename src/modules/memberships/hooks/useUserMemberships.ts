import { useQuery } from '@tanstack/react-query';
import { membershipService } from '../services/implementation.membership-service';

export function useUserMemberships(userId: string | undefined) {
    const query = useQuery({
        queryKey: ['memberships', userId],
        queryFn: () => membershipService.getByUserId(userId!),
        enabled: !!userId,
    });

    return {
        memberships: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
