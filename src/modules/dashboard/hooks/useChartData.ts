'use client';

import { useQuery } from '@tanstack/react-query';
import type { ChartDataPoint } from '@/app/api/dashboard/chart-data/route';

export function useChartData(range: string) {
    return useQuery({
        queryKey: ['dashboard', 'chart-data', range],
        queryFn: async (): Promise<ChartDataPoint[]> => {
            const res = await fetch(`/api/dashboard/chart-data?range=${range}`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? 'Failed to fetch chart data');
            }
            const json = await res.json();
            return json.data ?? [];
        },
    });
}
