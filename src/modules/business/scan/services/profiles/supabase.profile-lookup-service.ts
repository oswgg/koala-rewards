import { createClient } from '@/infrastructure/supabase/client';
import {
    BusinessProfilesLookupService,
    CreateProfileAndMembershipsInput,
} from './interface.profiles-lookup-service';

type FindProfileByContactRow = {
    name: string | null;
};

export const supabaseProfilesLookupService: BusinessProfilesLookupService = {
    findNameByContact: async (input: string): Promise<string | null> => {
        const trimmed = input.trim();
        if (!trimmed) return null;

        const supabase = createClient();
        const { data, error } = await supabase.rpc('find_profile_by_contact', {
            input: trimmed,
        });

        if (error) {
            console.error('find_profile_by_contact', error);
            return null;
        }

        const rows = data as FindProfileByContactRow[] | null;
        const name = rows?.[0]?.name;
        if (name == null || String(name).trim() === '') return null;
        return String(name).trim();
    },

    createProfileAndMemberships: async (input: CreateProfileAndMembershipsInput): Promise<void> => {
        const supabase = createClient();
        const { data, error } = await supabase.rpc('create_profile_and_memberships', {
            input: input,
        });

        if (error) {
            throw error;
        }

        return data;
    },
};
