import { useMutation } from '@tanstack/react-query';
import { businessProfilesLookupService } from '../services/profiles/implementation.profiles-lookup-service';
import { CreateProfileAndMembershipsInput } from '../services/profiles/interface.profiles-lookup-service';

export function useCreateProfileAndMembershipMutation() {
    return useMutation({
        mutationFn: async (input: CreateProfileAndMembershipsInput) =>
            businessProfilesLookupService.createProfileAndMemberships(input),
        onError: (error) => {
            console.error('Error creating profile and memberships', error);
        },
        onSuccess: (data) => {
            console.log(data);
            console.log('Profile and memberships created successfully');
        },
    });
}
