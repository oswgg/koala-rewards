import { createClient } from './supabase/client';
import {
    createSupabaseAuthService,
    createSupabaseProgramsService,
    createSupabaseMembershipService,
    createSupabaseMembershipsRealtimeService,
    createSupabaseCardActivityService,
    createSupabaseProfilesLookupService,
} from '@koalacards/core';

export const authService = createSupabaseAuthService(createClient);
export const programsService = createSupabaseProgramsService(createClient);
export const membershipService = createSupabaseMembershipService(createClient);
export const membershipsRealtimeService = createSupabaseMembershipsRealtimeService(createClient);
export const cardActivityService = createSupabaseCardActivityService(createClient, membershipService);
export const profilesLookupService = createSupabaseProfilesLookupService(createClient);
