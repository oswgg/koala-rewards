import { type BusinessProfilesLookupService } from './interface.profiles-lookup-service';
import { supabaseProfilesLookupService } from './supabase.profile-lookup-service';

export const businessProfilesLookupService: BusinessProfilesLookupService =
    supabaseProfilesLookupService;
