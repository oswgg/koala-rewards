import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getServerAuthUser } from '@/infrastructure/auth/server';
import { createClient } from '@/infrastructure/supabase/server';

export interface MetricChange {
    value: string;
    positive: boolean;
}

export interface DashboardMetrics {
    activeClientsLast30Days: number;
    activeClientsChange: MetricChange;
    recurringClients: number;
    recurringClientsPercent: number;
    recurringClientsChange: MetricChange;
    visitsThisMonth: number;
    visitsChange: MetricChange;
    rewardsRedeemedThisMonth: number;
    rewardsChange: MetricChange;
    activeCards: number;
    activeCardsChange: MetricChange;
    clientsNearReward: number;
    clientsNearRewardChange: MetricChange;
}

function formatChange(current: number, previous: number): MetricChange {
    if (previous === 0) {
        return { value: current > 0 ? '+100%' : '0%', positive: current >= 0 };
    }
    const pct = Math.round(((current - previous) / previous) * 100);
    const sign = pct >= 0 ? '+' : '';
    return { value: `${sign}${pct}%`, positive: pct >= 0 };
}

function getLast30DaysRange() {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { start: start.toISOString(), end: end.toISOString() };
}

function getPrevious30DaysRange() {
    const end = new Date();
    end.setDate(end.getDate() - 30);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { start: start.toISOString(), end: end.toISOString() };
}

function getThisMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
}

function getLastMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
}

function getMonthStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function GET() {
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

        const businessId = staff.business_id;
        const { start: last30Start, end: last30End } = getLast30DaysRange();
        const { start: prev30Start, end: prev30End } = getPrevious30DaysRange();
        const { start: monthStart, end: monthEnd } = getThisMonthRange();
        const { start: lastMonthStart, end: lastMonthEnd } = getLastMonthRange();
        const monthStartDate = getMonthStart();

        const { data: businessPrograms } = await supabase
            .from('loyalty_programs')
            .select('id, type, reward_cost')
            .eq('business_id', businessId);
        const programIds = (businessPrograms ?? []).map((p) => p.id);

        const programsWithReward = (businessPrograms ?? []).filter(
            (p) => p.reward_cost != null && p.type !== 'cashback'
        );

        const emptyChange: MetricChange = { value: '0%', positive: true };

        if (programIds.length === 0) {
            return NextResponse.json({
                activeClientsLast30Days: 0,
                activeClientsChange: emptyChange,
                recurringClients: 0,
                recurringClientsPercent: 0,
                recurringClientsChange: emptyChange,
                visitsThisMonth: 0,
                visitsChange: emptyChange,
                rewardsRedeemedThisMonth: 0,
                rewardsChange: emptyChange,
                activeCards: 0,
                activeCardsChange: emptyChange,
                clientsNearReward: 0,
                clientsNearRewardChange: emptyChange,
            } satisfies DashboardMetrics);
        }

        const { data: membershipIds } = await supabase
            .from('program_memberships')
            .select('id')
            .in('program_id', programIds);
        const ids = (membershipIds ?? []).map((m) => m.id);

        const activeCards = ids.length;

        if (ids.length === 0) {
            return NextResponse.json({
                activeClientsLast30Days: 0,
                activeClientsChange: emptyChange,
                recurringClients: 0,
                recurringClientsPercent: 0,
                recurringClientsChange: emptyChange,
                visitsThisMonth: 0,
                visitsChange: emptyChange,
                rewardsRedeemedThisMonth: 0,
                rewardsChange: emptyChange,
                activeCards: 0,
                activeCardsChange: emptyChange,
                clientsNearReward: 0,
                clientsNearRewardChange: emptyChange,
            } satisfies DashboardMetrics);
        }

        const [
            { data: activitiesLast30 },
            { data: activitiesPrev30 },
            { data: activitiesThisMonth },
            { data: activitiesLastMonth },
            { data: redeemsThisMonth },
            { data: redeemsLastMonth },
            { data: membershipsAtMonthStart },
        ] = await Promise.all([
            supabase
                .from('card_activity')
                .select('membership_id')
                .in('membership_id', ids)
                .eq('type', 'earn')
                .gte('registered_at', last30Start)
                .lte('registered_at', last30End),
            supabase
                .from('card_activity')
                .select('membership_id')
                .in('membership_id', ids)
                .eq('type', 'earn')
                .gte('registered_at', prev30Start)
                .lte('registered_at', prev30End),
            supabase
                .from('card_activity')
                .select('membership_id')
                .in('membership_id', ids)
                .eq('type', 'earn')
                .gte('registered_at', monthStart)
                .lte('registered_at', monthEnd),
            supabase
                .from('card_activity')
                .select('membership_id')
                .in('membership_id', ids)
                .eq('type', 'earn')
                .gte('registered_at', lastMonthStart)
                .lte('registered_at', lastMonthEnd),
            supabase
                .from('card_activity')
                .select('id')
                .in('membership_id', ids)
                .eq('type', 'redeem')
                .gte('registered_at', monthStart)
                .lte('registered_at', monthEnd),
            supabase
                .from('card_activity')
                .select('id')
                .in('membership_id', ids)
                .eq('type', 'redeem')
                .gte('registered_at', lastMonthStart)
                .lte('registered_at', lastMonthEnd),
            supabase
                .from('program_memberships')
                .select('id')
                .in('program_id', programIds)
                .lt('created_at', monthStartDate.toISOString()),
        ]);

        const visitsThisMonth = activitiesThisMonth?.length ?? 0;
        const visitsLastMonth = activitiesLastMonth?.length ?? 0;
        const rewardsRedeemedThisMonth = redeemsThisMonth?.length ?? 0;

        const visitsByMembership = new Map<string, number>();
        for (const a of activitiesLast30 ?? []) {
            const count = visitsByMembership.get(a.membership_id) ?? 0;
            visitsByMembership.set(a.membership_id, count + 1);
        }
        const prevVisitsByMembership = new Map<string, number>();
        for (const a of activitiesPrev30 ?? []) {
            const count = prevVisitsByMembership.get(a.membership_id) ?? 0;
            prevVisitsByMembership.set(a.membership_id, count + 1);
        }

        const activeClientsLast30Days = visitsByMembership.size;
        const activeClientsPrev30 = prevVisitsByMembership.size;
        const recurringClients = [...visitsByMembership.values()].filter((c) => c >= 2).length;
        const recurringClientsPrev = [...prevVisitsByMembership.values()].filter(
            (c) => c >= 2
        ).length;
        const recurringClientsPercent =
            activeClientsLast30Days > 0
                ? Math.round((recurringClients / activeClientsLast30Days) * 100)
                : 0;

        const activeCardsAtMonthStart = membershipsAtMonthStart?.length ?? 0;
        const rewardsRedeemedLastMonth = redeemsLastMonth?.length ?? 0;

        let clientsNearReward = 0;
        if (programsWithReward.length > 0) {
            const { data: membershipsWithBalance } = await supabase
                .from('program_memberships')
                .select('id, balance, program_id')
                .in(
                    'program_id',
                    programsWithReward.map((p) => p.id)
                );

            for (const m of membershipsWithBalance ?? []) {
                const program = programsWithReward.find((p) => p.id === m.program_id);
                if (!program?.reward_cost) continue;
                const balance = Number(m.balance);
                const cost = Number(program.reward_cost);
                if (balance < cost && balance >= cost) {
                    clientsNearReward++;
                }
            }
        }

        const activeClientsChange = formatChange(activeClientsLast30Days, activeClientsPrev30);
        const recurringClientsChange = formatChange(recurringClients, recurringClientsPrev);
        const visitsChange = formatChange(visitsThisMonth, visitsLastMonth);
        const rewardsChange = formatChange(rewardsRedeemedThisMonth, rewardsRedeemedLastMonth);
        const activeCardsChange = formatChange(activeCards, activeCardsAtMonthStart);
        const funnelThisMonth = clientsNearReward + rewardsRedeemedThisMonth;
        const funnelLastMonth = rewardsRedeemedLastMonth;
        const clientsNearRewardChange = formatChange(funnelThisMonth, funnelLastMonth);

        return NextResponse.json({
            activeClientsLast30Days,
            activeClientsChange,
            recurringClients,
            recurringClientsPercent,
            recurringClientsChange,
            visitsThisMonth,
            visitsChange,
            rewardsRedeemedThisMonth,
            rewardsChange,
            activeCards,
            activeCardsChange,
            clientsNearReward,
            clientsNearRewardChange,
        } satisfies DashboardMetrics);
    } catch (err) {
        console.error('[dashboard/metrics]', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to fetch metrics' },
            { status: 500 }
        );
    }
}
