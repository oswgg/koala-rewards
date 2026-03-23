import type { SupabaseClient } from '@supabase/supabase-js';
import type {
    BusinessProfilesLookupService,
    CreateProfileAndMembershipsInput,
    ProfileByContact,
} from './profiles-lookup-service.interface';

type FindProfileByContactRow = {
    id: string;
    name: string | null;
    email: string | null;
    phone_number: string | null;
};

function normalizeContactForLookup(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return '';
    if (trimmed.includes('@')) return trimmed;
    return trimmed.replace(/\s/g, '');
}

export function createSupabaseProfilesLookupService(
    getClient: () => SupabaseClient
): BusinessProfilesLookupService {
    async function findProfileByContactImpl(input: string): Promise<ProfileByContact | null> {
        const normalized = normalizeContactForLookup(input);
        if (!normalized) return null;

        const supabase = getClient();
        const { data, error } = await supabase.rpc('find_profile_by_contact', {
            input: normalized,
        });

        if (error) {
            console.error('find_profile_by_contact', error);
            return null;
        }

        const rows = data as FindProfileByContactRow[] | null;
        const row = rows?.[0];
        if (!row?.id) return null;

        const name = row.name != null ? String(row.name).trim() : '';
        return {
            profileId: row.id,
            name: name || 'Cliente',
        };
    }

    return {
        findProfileByContact: findProfileByContactImpl,

        findNameByContact: async (input: string): Promise<string | null> => {
            const profile = await findProfileByContactImpl(input);
            return profile?.name ?? null;
        },

        createProfileAndMemberships: async (
            input: CreateProfileAndMembershipsInput
        ): Promise<void> => {
            const supabase = getClient();
            const { data, error } = await supabase.rpc('create_profile_and_memberships', {
                input: input,
            });

            if (error) throw error;
            return data;
        },
    };
}
