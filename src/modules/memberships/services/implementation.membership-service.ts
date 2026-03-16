import type { MembershipService } from './interface.membership-service';
import { supabaseMembershipService } from './supabase.membership-service';

export const membershipService: MembershipService = supabaseMembershipService;
