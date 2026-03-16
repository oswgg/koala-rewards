import { createClient } from '@/infrastructure/supabase/client';
import type { MembershipsRealtimeService } from './interface.memberships-realtime-service';

const CHANNEL_NAME = 'memberships-realtime';

export const supabaseMembershipsRealtimeService: MembershipsRealtimeService = {
    subscribe: (userId, options) => {
        const { onBalanceChange, onRedeem, membershipIds = [] } = options;
        const membershipIdSet = new Set(membershipIds);
        const supabase = createClient();

        const channel = supabase
            .channel(CHANNEL_NAME)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'program_memberships',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const newRow = payload.new as { id: string; balance: number };
                    onBalanceChange(newRow.id, Number(newRow.balance));
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'card_activity',
                    filter: 'type=eq.redeem',
                },
                (payload) => {
                    const row = payload.new as { membership_id: string };
                    if (membershipIdSet.has(row.membership_id)) {
                        onRedeem?.(row.membership_id);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
};
