'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipActivitiesRepository } from '@/infrastructure';
import { RegisterRedeemActivityInput } from '@koalacards/loyalty';

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
            return membershipActivitiesRepository.registerRedeemActivity(input, staffId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['membership'] });
        },
    });
}
