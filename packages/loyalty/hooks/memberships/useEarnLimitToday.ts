'use client';

import { MembershipsRepository } from '@vado/loyalty/core';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

export interface EarnLimitTodayProps {
    membershipRepository: MembershipsRepository;
    membershipId: string | undefined;
    limitOnePerDay: boolean;
}

export const earnTodayQueryKey = (membershipId: string) => ['earn-today', membershipId] as const;

/**
 * Indica si ya hay al menos un registro tipo `earn` hoy (UTC) para esta membresía.
 * Solo consulta cuando `limitOnePerDay` es true (programas con límite diario).
 */
export function useEarnLimitToday({
    membershipRepository,
    membershipId,
    limitOnePerDay,
}: EarnLimitTodayProps): UseQueryResult<boolean, Error> {
    return useQuery({
        queryKey: membershipId ? earnTodayQueryKey(membershipId) : ['earn-today', 'none'],
        queryFn: async () => {
            return membershipRepository.hasEarnActivityToday(membershipId!);
        },
        enabled: Boolean(membershipId && limitOnePerDay),
    });
}
