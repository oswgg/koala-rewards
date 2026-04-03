import { useQuery } from '@tanstack/react-query';
import { programsRepository } from '@/infrastructure';

export const programsQueryKey = ['programs'] as const;

export function usePrograms() {
    const query = useQuery({
        queryKey: programsQueryKey,
        queryFn: () => programsRepository.getAll(),
    });

    return {
        programs: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
