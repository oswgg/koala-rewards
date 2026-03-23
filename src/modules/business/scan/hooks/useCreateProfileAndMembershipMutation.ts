import { useMutation } from '@tanstack/react-query';
import { supabaseProfilesLookupService } from '../services/profiles/supabase.profile-lookup-service';
import { CreateProfileAndMembershipsInput } from '../services/profiles/interface.profiles-lookup-service';

export function useCreateProfileAndMembershipMutation() {
    return useMutation({
        mutationFn: async (input: CreateProfileAndMembershipsInput) =>
            supabaseProfilesLookupService.createProfileAndMemberships(input),
        onError: (error) => {
            console.error('Error creating profile and memberships', error);
        },
        onSuccess: (data) => {
            console.log(data);
            console.log('Profile and memberships created successfully');
        },
    });
}
