import { useQuery } from '@tanstack/react-query';
import { programsService } from '../services/implementation.programs-service';

export function programByPublicIdQueryKey(publicId: string) {
    return ['program', publicId] as const;
}

export function useProgramByPublicId(publicId: string | undefined) {
    const query = useQuery({
        queryKey: programByPublicIdQueryKey(publicId ?? ''),
        queryFn: () => programsService.getByPublicId(publicId!),
        enabled: !!publicId,
    });

    return {
        program: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
}
