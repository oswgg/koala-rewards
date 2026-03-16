'use client';

import { useQuery } from '@tanstack/react-query';
import type { DashboardMetrics } from '@/app/api/dashboard/metrics/route';

export function useDashboardMetrics() {
    return useQuery({
        queryKey: ['dashboard', 'metrics'],
        queryFn: async (): Promise<DashboardMetrics> => {
            const res = await fetch('/api/dashboard/metrics');
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? 'Failed to fetch metrics');
            }
            return res.json();
        },
    });
}
