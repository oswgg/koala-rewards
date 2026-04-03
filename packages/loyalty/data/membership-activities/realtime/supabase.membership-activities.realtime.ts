import { SupabaseClient } from '@supabase/supabase-js';

import {
    MembershipActivitiesRealtimeScope,
    MembershipActivitiesRealtimeService,
    MembershipActivitiesRealtimeSubscription,
} from './membership-activities.realtime.interface';

import { MembershipActivitiesRealtimeEvent } from './membership-activities.reatime-events';

export class SupabaseMembershipActivitiesRealtimeService implements MembershipActivitiesRealtimeService {
    constructor(private readonly supabase: SupabaseClient) {}

    subscribe(
        scope: MembershipActivitiesRealtimeScope,
        onEvent: (event: MembershipActivitiesRealtimeEvent) => void
    ): MembershipActivitiesRealtimeSubscription {
        const channel = this.supabase.channel(this.buildChannelName(scope));

        let isUnsubscribed = false;

        // --- CLIENT ---
        if (scope.type === 'CLIENT') {
            const membershipSet = new Set(scope.membershipIds ?? []);

            // 🔹 EARN → UPDATE en memberships
            channel.on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'program_memberships',
                    filter: `profile_id=eq.${scope.profileId}`,
                },
                (payload) => {
                    if (isUnsubscribed) return;

                    const row = payload.new as {
                        id: string;
                        balance: number;
                    };

                    if (membershipSet.size === 0 || membershipSet.has(row.id)) {
                        onEvent({
                            type: 'EARN',
                            membershipId: row.id,
                            newBalance: Number(row.balance),
                        });
                    }
                }
            );

            // 🔹 REDEEM → INSERT en card_activity
            channel.on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'card_activity',
                    filter: `profile_id=eq.${scope.profileId}`,
                },
                (payload) => {
                    if (isUnsubscribed) return;

                    const row = payload.new as {
                        membership_id: string;
                        type: string;
                    };

                    if (row.type !== 'redeem') return;

                    if (membershipSet.size === 0 || membershipSet.has(row.membership_id)) {
                        onEvent({
                            type: 'REDEEM',
                            membershipId: row.membership_id,
                        });
                    }
                }
            );
        }

        channel.subscribe();

        return {
            unsubscribe: () => {
                if (isUnsubscribed) return;
                isUnsubscribed = true;

                this.supabase.removeChannel(channel);
            },
        };
    }

    private buildChannelName(scope: MembershipActivitiesRealtimeScope): string {
        if (scope.type === 'CLIENT') {
            return `membership-activities-client-${scope.profileId}`;
        }

        return `memberhip-activities-staff-${scope.businessId}`;
    }
}
