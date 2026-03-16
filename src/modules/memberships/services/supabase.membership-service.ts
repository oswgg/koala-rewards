import { createClient } from '@/infrastructure/supabase/client';
import type { MembershipService, MembershipWithProgram } from './interface.membership-service';
import type { ProgramMembership } from '@/shared/types/membership';
import type { StoredLoyaltyProgram } from '@/shared/types/loyalty-program';

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
        user_id: data.user_id,
        membership_client_id: data.membership_client_id,
        balance: data.balance,
        created_at: data.created_at,
        public_id: data.public_id,
        business: data.business,
    } as ProgramMembership;
}

export const supabaseMembershipService: MembershipService = {
    create: async (programId: string, userId: string): Promise<ProgramMembership> => {
        const supabase = createClient();
        const membershipClientId = crypto.randomUUID();
        const { data, error } = await supabase
            .from('program_memberships')
            .insert({
                program_id: programId,
                user_id: userId,
                membership_client_id: membershipClientId,
                balance: 0,
            })
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .single();

        if (error) throw error;
        return toProgramMembership(data);
    },

    createWithClientId: async (
        programId: string,
        userId: string,
        membershipClientId: string
    ): Promise<ProgramMembership> => {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('program_memberships')
            .insert({
                program_id: programId,
                user_id: userId,
                membership_client_id: membershipClientId,
                balance: 0,
            })
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .single();

        if (error) throw error;
        return toProgramMembership(data);
    },

    hasMembership: async (programId: string, userId: string): Promise<boolean> => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('program_memberships')
            .select('id')
            .eq('program_id', programId)
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return data !== null;
    },

    getByUserId: async (userId: string) => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('program_memberships')
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .eq('user_id', userId)
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

    getByClientId: async (membershipClientId: string) => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('program_memberships')
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .eq('membership_client_id', membershipClientId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;
        return toMembershipWithProgram(data);
    },

};
