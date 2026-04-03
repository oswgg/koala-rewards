import { utcDayBoundsIso } from '@koalacards/loyalty/core/domain/activities/earn-limit';
import { StoredLoyaltyProgram } from '@koalacards/loyalty/core/domain/types/loyalty-program';
import {
    MembershipWithProgram,
    ProgramMembership,
} from '@koalacards/loyalty/core/domain/types/membership';
import { RemoteMembershipDataSource } from './memberships.remote.datasource.interface';
import { getProfileIdByAuthUserId } from '@koalacards/loyalty/core/lib/resolve-profile-id';
import { SupabaseClient } from '@supabase/supabase-js';

const MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS = `
    *,
    program:loyalty_programs(*),
    business:businesses(*)
`;

function toMembershipWithProgram(
    row: Record<string, unknown> & { program?: unknown; business?: unknown }
): MembershipWithProgram {
    const program = row.program as StoredLoyaltyProgram;
    const business = row.business;
    return {
        ...row,
        program: { ...program, business },
        business: business!,
    } as MembershipWithProgram;
}

function toProgramMembership(data: Record<string, unknown>): ProgramMembership {
    return {
        id: data.id,
        program_id: data.program_id,
        profile_id: data.profile_id,
        balance: data.balance,
        created_at: data.created_at,
        public_id: data.public_id,
        business: data.business,
    } as ProgramMembership;
}

export class SupabaseMembershipsRemoteDataSource implements RemoteMembershipDataSource {
    constructor(private readonly supabase: SupabaseClient) {}

    async create(programId: string, userId: string): Promise<ProgramMembership> {
        const profileId = await getProfileIdByAuthUserId(this.supabase, userId);
        if (!profileId) {
            throw new Error('No se encontro perfil para el usuario');
        }

        const { data, error } = await this.supabase
            .from('program_memberships')
            .insert({
                program_id: programId,
                profile_id: profileId,
                balance: 0,
            })
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .single();

        if (error) throw error;
        return toProgramMembership(data);
    }

    async hasMembership(programId: string, userId: string): Promise<boolean> {
        const profileId = await getProfileIdByAuthUserId(this.supabase, userId);
        if (!profileId) return false;

        const { data, error } = await this.supabase
            .from('program_memberships')
            .select('id')
            .eq('program_id', programId)
            .eq('profile_id', profileId)
            .maybeSingle();

        if (error) throw error;
        return data !== null;
    }

    async getByUserId(userId: string): Promise<MembershipWithProgram[]> {
        const profileId = await getProfileIdByAuthUserId(this.supabase, userId);
        if (!profileId) return [];

        const { data, error } = await this.supabase
            .from('program_memberships')
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .eq('profile_id', profileId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data ?? []).map((row) => toMembershipWithProgram(row));
    }

    async getByPublicId(publicId: string): Promise<MembershipWithProgram | null> {
        const { data, error } = await this.supabase
            .from('program_memberships')
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .eq('public_id', publicId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;
        return toMembershipWithProgram(data);
    }

    async getByProgramIdAndUserId(
        programId: string,
        userId: string
    ): Promise<MembershipWithProgram | null> {
        const profileId = await getProfileIdByAuthUserId(this.supabase, userId);
        if (!profileId) return null;

        const { data, error } = await this.supabase
            .from('program_memberships')
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .eq('program_id', programId)
            .eq('profile_id', profileId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;
        return toMembershipWithProgram(data);
    }

    async getByProgramIdAndProfileId(
        programId: string,
        profileId: string
    ): Promise<MembershipWithProgram | null> {
        const { data, error } = await this.supabase
            .from('program_memberships')
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .eq('program_id', programId)
            .eq('profile_id', profileId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;
        return toMembershipWithProgram(data);
    }

    async getByProgramPublicIdAndUserId(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram | null> {
        const { data: program, error: programError } = await this.supabase
            .from('loyalty_programs')
            .select('id')
            .eq('public_id', programPublicId)
            .eq('is_active', true)
            .maybeSingle();

        if (programError || !program) return null;

        const profileId = await getProfileIdByAuthUserId(this.supabase, userId);
        if (!profileId) return null;

        const { data, error } = await this.supabase
            .from('program_memberships')
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .eq('program_id', program.id)
            .eq('profile_id', profileId)
            .maybeSingle();

        if (error) throw error;
        return data ? toMembershipWithProgram(data) : null;
    }

    async getByProgramPublicIdAndProfileId(
        programPublicId: string,
        profileId: string
    ): Promise<MembershipWithProgram | null> {
        const { data: program, error: programError } = await this.supabase
            .from('loyalty_programs')
            .select('id')
            .eq('public_id', programPublicId)
            .eq('is_active', true)
            .maybeSingle();

        if (programError || !program) return null;

        const { data, error } = await this.supabase
            .from('program_memberships')
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .eq('program_id', program.id)
            .eq('profile_id', profileId)
            .maybeSingle();

        if (error) throw error;
        return data ? toMembershipWithProgram(data) : null;
    }

    async createByProgramPublicIdAndUserId(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram | null> {
        const { data: program, error: programError } = await this.supabase
            .from('loyalty_programs')
            .select('id')
            .eq('public_id', programPublicId)
            .eq('is_active', true)
            .maybeSingle();

        if (programError || !program) return null;

        const profileId = await getProfileIdByAuthUserId(this.supabase, userId);
        if (!profileId) return null;

        const { data: created, error: insertError } = await this.supabase
            .from('program_memberships')
            .insert({ program_id: program.id, profile_id: profileId, balance: 0 })
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .single();

        if (insertError) {
            const isDuplicate =
                insertError.code === '23505' ||
                /unique|duplicate|23505/i.test(String(insertError.message ?? ''));
            if (isDuplicate) {
                const { data: existing } = await this.supabase
                    .from('program_memberships')
                    .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
                    .eq('program_id', program.id)
                    .eq('profile_id', profileId)
                    .maybeSingle();
                return existing ? toMembershipWithProgram(existing) : null;
            }
            throw insertError;
        }

        return created ? toMembershipWithProgram(created) : null;
    }

    async createByProgramPublicIdAndProfileId(
        programPublicId: string,
        profileId: string
    ): Promise<MembershipWithProgram | null> {
        const { data: program, error: programError } = await this.supabase
            .from('loyalty_programs')
            .select('id')
            .eq('public_id', programPublicId)
            .eq('is_active', true)
            .maybeSingle();

        if (programError || !program) return null;

        const { data: created, error: insertError } = await this.supabase
            .from('program_memberships')
            .insert({ program_id: program.id, profile_id: profileId, balance: 0 })
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .single();

        if (insertError) {
            const isDuplicate =
                insertError.code === '23505' ||
                /unique|duplicate|23505/i.test(String(insertError.message ?? ''));
            if (isDuplicate) {
                const { data: existing } = await this.supabase
                    .from('program_memberships')
                    .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
                    .eq('program_id', program.id)
                    .eq('profile_id', profileId)
                    .maybeSingle();
                return existing ? toMembershipWithProgram(existing) : null;
            }
            throw insertError;
        }

        return created ? toMembershipWithProgram(created) : null;
    }

    async hasEarnActivityToday(membershipId: string): Promise<boolean> {
        const { startIso, endIso } = utcDayBoundsIso();
        const { data, error } = await this.supabase
            .from('card_activity')
            .select('id')
            .eq('membership_id', membershipId)
            .eq('type', 'earn')
            .gte('registered_at', startIso)
            .lt('registered_at', endIso)
            .limit(1);

        if (error) throw error;
        return Array.isArray(data) && data.length > 0;
    }
}
