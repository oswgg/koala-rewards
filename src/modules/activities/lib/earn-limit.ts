import { createClient } from '@/infrastructure/supabase/client';

export type SupabaseBrowserClient = ReturnType<typeof createClient>;

export const earnTodayQueryKey = (membershipId: string) => ['earn-today', membershipId] as const;

/** Rango [start, end) del día civil en UTC (coincide con el chequeo en servidor y reportes). */
export function utcDayBoundsIso(): { startIso: string; endIso: string } {
    const now = new Date();
    const start = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
    );
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    return { startIso: start.toISOString(), endIso: end.toISOString() };
}
