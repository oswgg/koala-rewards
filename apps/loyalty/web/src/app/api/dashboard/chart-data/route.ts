import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getServerAuthUser } from '@/infrastructure/auth/server';
import { createClient } from '@/infrastructure/supabase/server';

export interface ChartDataPoint {
    date: string;
    visitors: number;
    fill: string;
}

function getDateRange(range: string): { start: Date; end: Date } {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);

    switch (range) {
        case '7d':
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            break;
        case '30d':
            start.setDate(start.getDate() - 29);
            start.setHours(0, 0, 0, 0);
            break;
        case '3m':
            start.setMonth(start.getMonth() - 3);
            start.setHours(0, 0, 0, 0);
            break;
        default:
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);
    }
    return { start, end };
}

function formatChartDate(d: Date, range: string): string {
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

/** Lunes de la semana ISO para la fecha dada */
function getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

function getWeekKey(d: Date): string {
    const monday = getMonday(d);
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

function formatWeekRange(weekStart: Date): string {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
    const startStr = weekStart.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
    });
    if (sameMonth) {
        return `${weekStart.getDate()}-${weekEnd.getDate()} ${weekStart.toLocaleDateString('es-ES', { month: 'short' })}`;
    }
    const endStr = weekEnd.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
    });
    return `${startStr} - ${endStr}`;
}

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const user = await getServerAuthUser(cookieStore);
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(Promise.resolve(cookieStore));
        const { data: staff } = await supabase
            .from('staff')
            .select('id, business_id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();

        if (!staff) {
            return NextResponse.json({ error: 'Staff record required' }, { status: 403 });
        }

        const range = request.nextUrl.searchParams.get('range') ?? '7d';
        const { start, end } = getDateRange(range);

        const { data: businessPrograms } = await supabase
            .from('loyalty_programs')
            .select('id')
            .eq('business_id', staff.business_id);
        const programIds = (businessPrograms ?? []).map((p) => p.id);

        if (programIds.length === 0) {
            const points = generateEmptyDataPoints(start, end, range);
            return NextResponse.json({ data: points });
        }

        const { data: membershipIds } = await supabase
            .from('program_memberships')
            .select('id')
            .in('program_id', programIds);
        const ids = (membershipIds ?? []).map((m) => m.id);

        if (ids.length === 0) {
            const points = generateEmptyDataPoints(start, end, range);
            return NextResponse.json({ data: points });
        }

        const { data: activities } = await supabase
            .from('card_activity')
            .select('membership_id, registered_at')
            .in('membership_id', ids)
            .eq('type', 'earn')
            .not('purchase_amount', 'is', null)
            .gte('registered_at', start.toISOString())
            .lte('registered_at', end.toISOString());

        const distinctByDay = new Map<string, Set<string>>();
        const distinctByWeek = new Map<string, Set<string>>();

        for (const a of activities ?? []) {
            const d = new Date(a.registered_at);
            const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            if (!distinctByDay.has(dayKey)) {
                distinctByDay.set(dayKey, new Set());
            }
            distinctByDay.get(dayKey)!.add(a.membership_id);

            const weekKey = getWeekKey(d);
            if (!distinctByWeek.has(weekKey)) {
                distinctByWeek.set(weekKey, new Set());
            }
            distinctByWeek.get(weekKey)!.add(a.membership_id);
        }

        const points =
            range === '3m' || range === '30d'
                ? generateWeeklyDataPoints(start, end, distinctByWeek)
                : generateDataPoints(start, end, range, distinctByDay);
        return NextResponse.json({ data: points });
    } catch (err) {
        console.error('[dashboard/chart-data]', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to fetch chart data' },
            { status: 500 }
        );
    }
}

function generateEmptyDataPoints(start: Date, end: Date, range: string): ChartDataPoint[] {
    if (range === '3m' || range === '30d') {
        return generateWeeklyDataPoints(start, end, new Map());
    }
    return generateDataPoints(start, end, range, new Map());
}

function generateWeeklyDataPoints(
    start: Date,
    end: Date,
    distinctByWeek: Map<string, Set<string>>
): ChartDataPoint[] {
    const points: ChartDataPoint[] = [];
    let current = getMonday(start);

    while (current <= end) {
        const key = getWeekKey(current);
        const count = distinctByWeek.get(key)?.size ?? 0;
        points.push({
            date: formatWeekRange(current),
            visitors: count,
            fill: 'var(--color-chart-1)',
        });
        current.setDate(current.getDate() + 7);
    }

    return points;
}

function generateDataPoints(
    start: Date,
    end: Date,
    range: string,
    distinctByDay: Map<string, Set<string>>
): ChartDataPoint[] {
    const points: ChartDataPoint[] = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);

    while (current <= end) {
        const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        const count = distinctByDay.get(key)?.size ?? 0;
        points.push({
            date: formatChartDate(current, range),
            visitors: count,
            fill: 'var(--color-chart-1)',
        });
        current.setDate(current.getDate() + 1);
    }

    return points;
}
