import { useMutation } from '@tanstack/react-query';
import type { CreateProfileAndMembershipsInput } from '@koalacards/loyalty';
import { profilesRepository } from '@/infrastructure';

export function useCreateProfileAndMembershipMutation() {
    return useMutation({
        mutationFn: async (input: CreateProfileAndMembershipsInput) =>
            profilesRepository.createProfileAndMemberships(input),
        onError: (error) => {
            console.error('Error creating profile and memberships', error);
        },
        onSuccess: (data) => {
            console.log(data);
            console.log('Profile and memberships created successfully');
        },
    });
}
