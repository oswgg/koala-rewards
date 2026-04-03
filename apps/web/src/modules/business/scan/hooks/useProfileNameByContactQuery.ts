import { useQuery } from '@tanstack/react-query';
import { profilesRepository } from '@/infrastructure';

export const profileByContactQueryKey = (phone: string) =>
    ['scan', 'new-customer', 'profile-by-contact', phone] as const;

export function useProfileNameByContactQuery(phone: string) {
    return useQuery({
        queryKey: profileByContactQueryKey(phone),
        queryFn: () => profilesRepository.findNameByContact(phone),
        enabled: phone.trim().length > 0,
        staleTime: Infinity,
    });
}
