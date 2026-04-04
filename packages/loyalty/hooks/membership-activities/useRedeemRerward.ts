'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MembershipActivitiesRepository, RegisterRedeemActivityInput } from '@vado/loyalty';

export interface UseRedeemRewardProps {
    membershipActivitiesRepository: MembershipActivitiesRepository;
}

export function useRedeemReward({ membershipActivitiesRepository }: UseRedeemRewardProps) {
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
