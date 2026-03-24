import type { SupabaseClient } from '@supabase/supabase-js';
import type { MembershipsRealtimeService } from './memberships-realtime-service.interface';
import { getProfileIdByAuthUserId } from '../../lib/resolve-profile-id';

const CHANNEL_NAME = 'memberships-realtime';

export function createSupabaseMembershipsRealtimeService(
    getClient: () => SupabaseClient
): MembershipsRealtimeService {
    return {
        subscribe: (authUserId, options) => {
            const { onBalanceChange, onRedeem, membershipIds = [] } = options;
            const membershipIdSet = new Set(membershipIds);
            const supabase = getClient();

            let channel: ReturnType<typeof supabase.channel> | null = null;
            let cancelled = false;

            void (async () => {
                const profileId = await getProfileIdByAuthUserId(supabase, authUserId);
                if (cancelled || !profileId) return;

                channel = supabase
                    .channel(`${CHANNEL_NAME}-${profileId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'program_memberships',
                            filter: `profile_id=eq.${profileId}`,
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
            })();

            return () => {
                cancelled = true;
                if (channel) {
                    supabase.removeChannel(channel);
                }
            };
        },
    };
}
