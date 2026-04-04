'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MembershipActivitiesRepository, RegisterEarnActivityInput } from '@vado/loyalty';
import { earnTodayQueryKey } from '../memberships';

export interface UseRegisterActivityProps {
    membershipActivitiesRepository: MembershipActivitiesRepository;
}

export function useRegisterActivity({ membershipActivitiesRepository }: UseRegisterActivityProps) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            input,
            staffId,
        }: {
            input: RegisterEarnActivityInput;
            staffId: number;
        }) => {
            return membershipActivitiesRepository.registerEarnActivity(input, staffId);
        },
        onSuccess: (_data, { input }) => {
            queryClient.invalidateQueries({ queryKey: ['membership'] });
            queryClient.invalidateQueries({ queryKey: earnTodayQueryKey(input.membershipId) });
        },
    });
}
