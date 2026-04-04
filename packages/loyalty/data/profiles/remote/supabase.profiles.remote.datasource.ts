import {
    CreateProfileAndMembershipsInput,
    ProfileByContact,
} from '@vado/loyalty/core/domain/types/profile';
import { ProfilesRemoteDataSource } from './profiles.remote.datasource.interface';
import { SupabaseClient } from '@supabase/supabase-js';

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

export class SupabaseProfilesRemoteDataSource implements ProfilesRemoteDataSource {
    constructor(private readonly supabase: SupabaseClient) {}

    async findProfileByContact(input: string): Promise<ProfileByContact | null> {
        const normalized = normalizeContactForLookup(input);
        if (!normalized) return null;

        const { data, error } = await this.supabase.rpc('find_profile_by_contact', {
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

    async findNameByContact(emailOrPhone: string): Promise<string | null> {
        const profile = await this.findProfileByContact(emailOrPhone);
        return profile?.name ?? null;
    }

    async createProfileAndMemberships(input: CreateProfileAndMembershipsInput): Promise<void> {
        const { error } = await this.supabase.rpc('create_profile_and_memberships', {
            input,
        });

        if (error) throw error;
    }
}
