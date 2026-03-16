import { useQuery } from '@tanstack/react-query';
import { membershipService } from '../services/implementation.membership-service';

export function useHasMembership(programId: string | undefined, userId: string | undefined) {
    const query = useQuery({
        queryKey: ['membership', programId, userId],
        queryFn: () => membershipService.hasMembership(programId!, userId!),
        enabled: !!programId && !!userId,
    });

    return {
        hasMembership: query.data ?? false,
        isLoading: query.isLoading,
        refetch: query.refetch,
    };
}
