import { membershipRepository } from '@/infrastructure';
import { useQuery } from '@tanstack/react-query';

export function useHasMembership(programId: string | undefined, userId: string | undefined) {
    const query = useQuery({
        queryKey: ['membership', programId, userId],
        queryFn: () => membershipRepository.hasMembership(programId!, userId!),
        enabled: !!programId && !!userId,
        networkMode: 'always',
    });

    return {
        hasMembership: query.data ?? false,
        isLoading: query.isLoading,
        refetch: query.refetch,
    };
}
