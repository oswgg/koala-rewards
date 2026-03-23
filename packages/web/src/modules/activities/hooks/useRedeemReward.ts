'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cardActivityService } from '../services/implementation.card-activity-service';
import type { RegisterRedeemActivityInput } from '@/shared/types/activity';

export function useRedeemReward() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            input,
            staffId,
        }: {
            input: RegisterRedeemActivityInput;
            staffId: number;
        }) => {
            return cardActivityService.registerRedeemActivity(input, staffId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['membership'] });
        },
    });
}
