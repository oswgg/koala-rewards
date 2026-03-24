import { useQuery } from '@tanstack/react-query';
import { programsService } from '../services/implementation.programs-service';

export const programsQueryKey = ['programs'] as const;

export function usePrograms() {
    const query = useQuery({
        queryKey: programsQueryKey,
        queryFn: () => programsService.getAll(),
    });

    return {
        programs: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
