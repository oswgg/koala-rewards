'use client';

import { useQuery } from '@tanstack/react-query';
import { earnTodayQueryKey } from '@/modules/activities/lib/earn-limit';
import { membershipRepository } from '@/infrastructure';

/**
 * Indica si ya hay al menos un registro tipo `earn` hoy (UTC) para esta membresía.
 * Solo consulta cuando `limitOnePerDay` es true (programas con límite diario).
 */
export function useEarnLimitToday(membershipId: string | undefined, limitOnePerDay: boolean) {
    return useQuery({
        queryKey: membershipId ? earnTodayQueryKey(membershipId) : ['earn-today', 'none'],
        queryFn: async () => {
            return membershipRepository.hasEarnActivityToday(membershipId!);
        },
        enabled: Boolean(membershipId && limitOnePerDay),
    });
}
