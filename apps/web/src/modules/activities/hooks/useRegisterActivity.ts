'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { earnTodayQueryKey } from '@/modules/activities/lib/earn-limit';
import { membershipActivitiesRepository } from '@/infrastructure';
import { RegisterEarnActivityInput } from '@koalacards/loyalty';

export function useRegisterActivity() {
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
