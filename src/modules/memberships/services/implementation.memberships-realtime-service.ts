import type { MembershipsRealtimeService } from './interface.memberships-realtime-service';
import { supabaseMembershipsRealtimeService } from './supabase.memberships-realtime-service';

export const membershipsRealtimeService: MembershipsRealtimeService =
    supabaseMembershipsRealtimeService;
