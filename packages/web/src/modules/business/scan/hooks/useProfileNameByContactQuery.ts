import { useQuery } from '@tanstack/react-query';
import { businessProfilesLookupService } from '../services/profiles/implementation.profiles-lookup-service';

export const profileByContactQueryKey = (phone: string) =>
    ['scan', 'new-customer', 'profile-by-contact', phone] as const;

export function useProfileNameByContactQuery(phone: string) {
    return useQuery({
        queryKey: profileByContactQueryKey(phone),
        queryFn: () => businessProfilesLookupService.findNameByContact(phone),
        enabled: phone.trim().length > 0,
        staleTime: Infinity,
    });
}
