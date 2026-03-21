'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cardActivityService } from '../services/implementation.card-activity-service';
import type { RegisterEarnActivityInput } from '@/shared/types/activity';
import { earnTodayQueryKey } from '@/modules/activities/lib/earn-limit';

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
            return cardActivityService.registerEarnActivity(input, staffId);
        },
        onSuccess: (_data, { input }) => {
            queryClient.invalidateQueries({ queryKey: ['membership'] });
            queryClient.invalidateQueries({ queryKey: earnTodayQueryKey(input.membershipId) });
        },
    });
}
