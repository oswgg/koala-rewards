import { createClient } from '@/infrastructure/supabase/client';
import type { MembershipWithProgram } from '../services/interface.membership-service';
import type { StoredLoyaltyProgram } from '@/shared/types/loyalty-program';
import type { RemoteMembershipDataSource } from './types.membership-datasource';
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

export class SupabaseMembershipDataSource implements RemoteMembershipDataSource {
    async create(programId: string, userId: string): Promise<MembershipWithProgram> {
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
        return toMembershipWithProgram(data);
    }

    async createByProgramPublicId(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram> {
        const supabase = createClient();
        const { data: program, error: programError } = await supabase
            .from('loyalty_programs')
            .select('id')
            .eq('public_id', programPublicId)
            .eq('is_active', true)
            .maybeSingle();

        if (programError || !program) {
            throw new Error('Programa no encontrado o no está disponible');
        }

        const profileId = await getProfileIdByAuthUserId(supabase, userId);
        if (!profileId) {
            throw new Error('No se encontró perfil para el usuario');
        }

        const { data, error } = await supabase
            .from('program_memberships')
            .insert({
                program_id: program.id,
                profile_id: profileId,
                balance: 0,
            })
            .select(MEMBERSHIP_WITH_PROGRAM_AND_BUSINESS)
            .single();

        if (error) {
            const errObj = error as { code?: string; message?: string };
            const isDuplicate =
                errObj.code === '23505' ||
                /unique|duplicate|23505/i.test(String(errObj.message ?? ''));
            if (isDuplicate) {
                const existing = await this.getByProgramPublicIdAndUserId(
                    programPublicId,
                    userId
                );
                if (existing) return existing;
            }
            throw error;
        }
        return toMembershipWithProgram(data);
    }

    async hasMembership(programId: string, userId: string): Promise<boolean> {
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
    }

    async hasMembershipByProgramPublicId(
        programPublicId: string,
        userId: string
    ): Promise<boolean> {
        const supabase = createClient();
        const profileId = await getProfileIdByAuthUserId(supabase, userId);
        if (!profileId) return false;
        const { data, error } = await supabase
            .from('program_memberships')
            .select('id, loyalty_programs!inner(public_id)')
            .eq('profile_id', profileId)
            .eq('loyalty_programs.public_id', programPublicId)
            .maybeSingle();

        if (error) throw error;
        return data !== null;
    }

    async getByUserId(userId: string): Promise<MembershipWithProgram[]> {
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
    }

    async getByProgramIdAndUserId(
        programId: string,
        userId: string
    ): Promise<MembershipWithProgram | null> {
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
        return data ? toMembershipWithProgram(data) : null;
    }

    async getByProgramPublicIdAndUserId(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram | null> {
        const supabase = createClient();
        const { data: program, error: programError } = await supabase
            .from('loyalty_programs')
            .select('id')
            .eq('public_id', programPublicId)
            .maybeSingle();

        if (programError || !program) return null;
        return this.getByProgramIdAndUserId(program.id, userId);
    }
}
