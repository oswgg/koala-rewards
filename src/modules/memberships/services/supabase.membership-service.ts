import { createClient } from '@/infrastructure/supabase/client';
import type { MembershipService, MembershipWithProgram } from './interface.membership-service';
import type { ProgramMembership } from '@/shared/types/membership';
import type { StoredLoyaltyProgram } from '@/shared/types/loyalty-program';
import { utcDayBoundsIso } from '@/modules/activities/lib/earn-limit';
import { getProfileIdByAuthUserId } from '@/modules/memberships/lib/resolve-profile-id';

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

export const supabaseMembershipService: MembershipService = {
    create: async (programId: string, userId: string): Promise<ProgramMembership> => {
        const supabase = createClient();
        const profileId = await getProfileIdByAuthUserId(supabase, userId);
        if (!profileId) {
            throw new Error('No se encontró perfil para el usuario');
        }
        const { data, error } = await supabase
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
    },

    hasMembership: async (programId: string, userId: string): Promise<boolean> => {
        const supabase = createClient();
        const profileId = await getProfileIdByAuthUserId(supabase, userId);
        if (!profileId) return false;
        const { data, error } = await supabase
            .from('program_memberships')
            .select('id')
            .eq('program_id', programId)
            .eq('profile_id', profileId)
            .maybeSingle();

        if (error) throw error;
        return data !== null;
    },

    getByUserId: async (userId: string) => {
        const supabase = createClient();
        const profileId = await getProfileIdByAuthUserId(supabase, userId);
        if (!profileId) return [];
        const { data, error } = await supabase
            .from('program_memberships')
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .eq('profile_id', profileId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data ?? []).map((row) => toMembershipWithProgram(row));
    },

    getByPublicId: async (publicId: string) => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('program_memberships')
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .eq('public_id', publicId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;
        return toMembershipWithProgram(data);
    },

    getByProgramIdAndUserId: async (programId: string, userId: string) => {
        const supabase = createClient();
        const profileId = await getProfileIdByAuthUserId(supabase, userId);
        if (!profileId) return null;
        const { data, error } = await supabase
            .from('program_memberships')
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .eq('program_id', programId)
            .eq('profile_id', profileId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;
        return toMembershipWithProgram(data);
    },

    getByProgramIdAndProfileId: async (programId: string, profileId: string) => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('program_memberships')
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .eq('program_id', programId)
            .eq('profile_id', profileId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;
        return toMembershipWithProgram(data);
    },

    getByProgramPublicIdAndUserId: async (programPublicId: string, userId: string) => {
        const supabase = createClient();
        const { data: program, error: programError } = await supabase
            .from('loyalty_programs')
            .select('id')
            .eq('public_id', programPublicId)
            .eq('is_active', true)
            .maybeSingle();

        if (programError || !program) return null;

        const profileId = await getProfileIdByAuthUserId(supabase, userId);
        if (!profileId) return null;

        const { data, error } = await supabase
            .from('program_memberships')
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .eq('program_id', program.id)
            .eq('profile_id', profileId)
            .maybeSingle();

        if (error) throw error;
        return data ? toMembershipWithProgram(data) : null;
    },

    getByProgramPublicIdAndProfileId: async (programPublicId: string, profileId: string) => {
        const supabase = createClient();
        const { data: program, error: programError } = await supabase
            .from('loyalty_programs')
            .select('id')
            .eq('public_id', programPublicId)
            .eq('is_active', true)
            .maybeSingle();

        if (programError || !program) return null;

        const { data, error } = await supabase
            .from('program_memberships')
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .eq('program_id', program.id)
            .eq('profile_id', profileId)
            .maybeSingle();

        if (error) throw error;
        return data ? toMembershipWithProgram(data) : null;
    },

    createByProgramPublicIdAndUserId: async (programPublicId: string, userId: string) => {
        const supabase = createClient();
        const { data: program, error: programError } = await supabase
            .from('loyalty_programs')
            .select('id')
            .eq('public_id', programPublicId)
            .eq('is_active', true)
            .maybeSingle();

        if (programError || !program) return null;

        const profileId = await getProfileIdByAuthUserId(supabase, userId);
        if (!profileId) return null;

        const { data: created, error: insertError } = await supabase
            .from('program_memberships')
            .insert({
                program_id: program.id,
                profile_id: profileId,
                balance: 0,
            })
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .single();

        if (insertError) {
            const isDuplicate =
                insertError.code === '23505' ||
                /unique|duplicate|23505/i.test(String(insertError.message ?? ''));
            if (isDuplicate) {
                const { data: existing } = await supabase
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
    },

    createByProgramPublicIdAndProfileId: async (programPublicId: string, profileId: string) => {
        const supabase = createClient();
        const { data: program, error: programError } = await supabase
            .from('loyalty_programs')
            .select('id')
            .eq('public_id', programPublicId)
            .eq('is_active', true)
            .maybeSingle();

        if (programError || !program) return null;

        const { data: created, error: insertError } = await supabase
            .from('program_memberships')
            .insert({
                program_id: program.id,
                profile_id: profileId,
                balance: 0,
            })
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .single();

        if (insertError) {
            const isDuplicate =
                insertError.code === '23505' ||
                /unique|duplicate|23505/i.test(String(insertError.message ?? ''));
            if (isDuplicate) {
                const { data: existing } = await supabase
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
    },

    hasEarnActivityToday: async (membershipId: string): Promise<boolean> => {
        const supabase = createClient();
        const { startIso, endIso } = utcDayBoundsIso();
        const { data, error } = await supabase
            .from('card_activity')
            .select('id')
            .eq('membership_id', membershipId)
            .eq('type', 'earn')
            .gte('registered_at', startIso)
            .lt('registered_at', endIso)
            .limit(1);

        if (error) throw error;
        return Array.isArray(data) && data.length > 0;
    },
};
