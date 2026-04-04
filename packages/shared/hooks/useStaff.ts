'use client';

import { useQuery } from '@tanstack/react-query';
import { AuthRepository, Staff } from '@vado/loyalty';
import { useUser } from './useUser';

export interface UseStaffProps {
    authRepository: AuthRepository;
}

export function useStaff({ authRepository }: UseStaffProps) {
    const { user } = useUser({ authRepository });

    return useQuery({
        queryKey: ['staff', user?.id],
        queryFn: async (): Promise<Staff | null> => {
            if (!user) return null;
            try {
                const data = authRepository.getStaffData(user.id);
                return data;
            } catch (err) {
                return null;
            }
        },
        enabled: !!user,
    });
}
