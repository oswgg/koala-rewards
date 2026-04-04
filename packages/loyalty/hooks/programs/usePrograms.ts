import { StoredLoyaltyProgram, ProgramsRepository } from '@vado/loyalty/core';
import { useQuery } from '@tanstack/react-query';

export const programsQueryKey = ['programs'] as const;

export interface UseProgramProps {
    programsRepository: ProgramsRepository;
}

export interface UseProgramsResult {
    programs: StoredLoyaltyProgram[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
}

export function usePrograms({ programsRepository }: UseProgramProps) {
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
