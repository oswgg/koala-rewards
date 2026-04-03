import { CreateProgramInput, StoredLoyaltyProgram } from '@koalacards/loyalty/core';
import { ProgramsRemoteDataSource } from '@koalacards/loyalty/data/programs/remote/programs.remote.datasource.interface';
import { SupabaseClient } from '@supabase/supabase-js';

const PROGRAM_WITH_BUSINESS = '*, business:businesses(*)';

export class SupabaseProgramsRemoteDataSource implements ProgramsRemoteDataSource {
    constructor(private readonly supabase: SupabaseClient) {}

    async create(program: CreateProgramInput) {
        const { data, error } = await this.supabase
            .from('loyalty_programs')
            .insert(program)
            .select(PROGRAM_WITH_BUSINESS)
            .single();

        if (error) throw error;
        return data as StoredLoyaltyProgram;
    }

    async getAll() {
        const {
            data: { user },
        } = await this.supabase.auth.getUser();
        if (!user?.id) return [];

        const { data: staff } = await this.supabase
            .from('staff')
            .select('business_id')
            .eq('user_id', user.id)
            .eq('type', 'admin')
            .limit(1)
            .maybeSingle();

        if (!staff?.business_id) return [];

        const { data, error } = await this.supabase
            .from('loyalty_programs')
            .select(PROGRAM_WITH_BUSINESS)
            .eq('business_id', staff.business_id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data ?? []) as StoredLoyaltyProgram[];
    }

    async getByPublicId(publicId: string) {
        const { data, error } = await this.supabase
            .from('loyalty_programs')
            .select(PROGRAM_WITH_BUSINESS)
            .eq('public_id', publicId)
            .eq('is_active', true)
            .maybeSingle();
        if (error) throw error;
        return data as StoredLoyaltyProgram | null;
    }
}
