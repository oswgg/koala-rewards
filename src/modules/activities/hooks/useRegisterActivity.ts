'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cardActivityService } from '../services/implementation.card-activity-service';
import type { RegisterEarnActivityInput } from '@/shared/types/activity';

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['membership'] });
        },
    });
}
