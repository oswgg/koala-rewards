'use client';

import { useQuery } from '@tanstack/react-query';
import type { DashboardTableResponse } from '@/app/api/dashboard/table-data/route';

export function useDashboardTableData() {
    return useQuery({
        queryKey: ['dashboard', 'table-data'],
        queryFn: async (): Promise<DashboardTableResponse> => {
            const res = await fetch('/api/dashboard/table-data');
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? 'Failed to fetch dashboard data');
            }
            return res.json();
        },
    });
}
