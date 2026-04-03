import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { getServerAuthUser } from '@/infrastructure/auth/server';
import { createClient } from '@/infrastructure/supabase/server';

type TabId = 'latest-activities' | 'new-customers' | 'sales' | 'rewards-claimed';

export interface DashboardTableRow {
    id: string;
    [key: string]: string;
}

export interface DashboardTableResponse {
    counts: Record<TabId, number>;
    data: Record<TabId, DashboardTableRow[]>;
}

function getTodayRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start: start.toISOString(), end: end.toISOString() };
}

function formatDate(iso: string, includeTime = false) {
    const d = new Date(iso);
    if (includeTime) {
        return d.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
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
        const { start, end } = getTodayRange();

        const customerLabel = 'Cliente';

        // Programas del negocio (para filtrar memberships si no tienen business_id directo)
        const { data: businessPrograms } = await supabase
            .from('loyalty_programs')
            .select('id')
            .eq('business_id', businessId);
        const programIds = (businessPrograms ?? []).map((p) => p.id);

        // 1. Nuevos clientes (program_memberships creados hoy)
        const { data: newMemberships } =
            programIds.length > 0
                ? await supabase
                      .from('program_memberships')
                      .select('id, profile_id, created_at')
                      .in('program_id', programIds)
                      .gte('created_at', start)
                      .lt('created_at', end)
                      .order('created_at', { ascending: false })
                : { data: [] };

        // 2. Obtener membership_ids del negocio
        const { data: membershipIds } =
            programIds.length > 0
                ? await supabase
                      .from('program_memberships')
                      .select('id')
                      .in('program_id', programIds)
                : { data: [] };

        const ids = (membershipIds ?? []).map((m) => m.id);
        if (ids.length === 0) {
            const emptyResponse: DashboardTableResponse = {
                counts: {
                    'latest-activities': 0,
                    'new-customers': newMemberships?.length ?? 0,
                    sales: 0,
                    'rewards-claimed': 0,
                },
                data: {
                    'latest-activities': [],
                    'new-customers': (newMemberships ?? []).map((m) => ({
                        id: m.id,
                        name: customerLabel,
                        date: formatDate(m.created_at),
                    })),
                    sales: [],
                    'rewards-claimed': [],
                },
            };
            for (const m of newMemberships ?? []) {
                emptyResponse.data['latest-activities'].push({
                    id: m.id,
                    client: customerLabel,
                    type: 'Nuevo cliente',
                    registered_by: '—',
                    date: formatDate(m.created_at, true),
                });
            }
            emptyResponse.counts['latest-activities'] =
                emptyResponse.data['latest-activities'].length;
            return NextResponse.json(emptyResponse);
        }

        const { data: activities } = await supabase
            .from('card_activity')
            .select(
                `
                id,
                type,
                quantity,
                purchase_amount,
                registered_at,
                registered_by_staff_id,
                membership_id,
                program_id
            `
            )
            .in('membership_id', ids)
            .gte('registered_at', start)
            .lt('registered_at', end)
            .order('registered_at', { ascending: false });

        const activityRows = (activities ?? []) as Array<{
            id: string;
            type: string;
            quantity: number;
            purchase_amount: number | null;
            registered_at: string;
            registered_by_staff_id: number;
            membership_id: string;
            program_id: string;
        }>;

        const staffIds = new Set(activityRows.map((a) => a.registered_by_staff_id));
        const membershipIdsFromActivities = [...new Set(activityRows.map((a) => a.membership_id))];
        const programIdsFromActivities = [...new Set(activityRows.map((a) => a.program_id))];

        const membershipById: Record<string, { profile_id: string }> = {};
        const programById: Record<string, { name: string; reward_description: string }> = {};

        if (membershipIdsFromActivities.length > 0) {
            const { data: membershipsForActivities } = await supabase
                .from('program_memberships')
                .select('id, profile_id')
                .in('id', membershipIdsFromActivities);
            (membershipsForActivities ?? []).forEach((m) => {
                membershipById[m.id] = { profile_id: m.profile_id };
            });
        }

        if (programIdsFromActivities.length > 0) {
            const { data: programsForActivities } = await supabase
                .from('loyalty_programs')
                .select('id, name, reward_description')
                .in('id', programIdsFromActivities);
            (programsForActivities ?? []).forEach((p) => {
                programById[p.id] = { name: p.name, reward_description: p.reward_description };
            });
        }

        // Staff names for "Registrado Por"
        const staffIdsArray = Array.from(staffIds);
        const staffNames: Record<number, string> = {};
        if (staffIdsArray.length > 0) {
            const { data: staffList } = await supabase
                .from('staff')
                .select('id, name')
                .in('id', staffIdsArray);
            (staffList ?? []).forEach((s) => {
                staffNames[s.id] = s.name;
            });
        }

        const sales: DashboardTableRow[] = [];
        const rewards: DashboardTableRow[] = [];
        const latest: DashboardTableRow[] = [];

        for (const a of activityRows) {
            const membership = membershipById[a.membership_id];
            const program = programById[a.program_id];
            if (!membership || !program) continue;

            const clientName = customerLabel;
            const registeredBy = staffNames[a.registered_by_staff_id] ?? '—';
            const date = formatDate(a.registered_at, true);

            if (a.type === 'earn') {
                const row: DashboardTableRow = {
                    id: a.id,
                    client: clientName,
                    amount: `$${Number(a.purchase_amount).toFixed(2)}`,
                    date,
                };
                sales.push(row);
                latest.push({
                    ...row,
                    type: 'Venta',
                    registered_by: registeredBy,
                });
            } else if (a.type === 'redeem') {
                const row: DashboardTableRow = {
                    id: a.id,
                    client: clientName,
                    program_name: program.name,
                    reward_name: program.reward_description,
                    date,
                };
                rewards.push(row);
                latest.push({
                    ...row,
                    type: 'Recompensa reclamada',
                    registered_by: registeredBy,
                });
            }
        }

        const newCustomers: DashboardTableRow[] = (newMemberships ?? []).map((m) => ({
            id: m.id,
            name: customerLabel,
            date: formatDate(m.created_at),
        }));

        for (const m of newMemberships ?? []) {
            latest.push({
                id: m.id,
                client: customerLabel,
                type: 'Nuevo cliente',
                registered_by: '—',
                date: formatDate(m.created_at, true),
            });
        }

        latest.sort((a, b) => {
            const dA = a.date;
            const dB = b.date;
            return dB.localeCompare(dA);
        });

        const response: DashboardTableResponse = {
            counts: {
                'latest-activities': latest.length,
                'new-customers': newCustomers.length,
                sales: sales.length,
                'rewards-claimed': rewards.length,
            },
            data: {
                'latest-activities': latest,
                'new-customers': newCustomers,
                sales,
                'rewards-claimed': rewards,
            },
        };

        return NextResponse.json(response);
    } catch (err) {
        console.error('[dashboard/table-data]', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
