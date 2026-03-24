import type { SupabaseClient } from '@supabase/supabase-js';
import type { StoredLoyaltyProgram } from '../../types/loyalty-program';
import type { ProgramsService } from './programs-service.interface';

const PROGRAM_WITH_BUSINESS = '*, business:businesses(*)';

export function createSupabaseProgramsService(getClient: () => SupabaseClient): ProgramsService {
    return {
        create: async (program) => {
            const supabase = getClient();
            const { data, error } = await supabase
                .from('loyalty_programs')
                .insert(program)
                .select(PROGRAM_WITH_BUSINESS)
                .single();

            if (error) throw error;
            return data as StoredLoyaltyProgram;
        },

        getAll: async () => {
            const supabase = getClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user?.id) return [];

            const { data: staff } = await supabase
                .from('staff')
                .select('business_id')
                .eq('user_id', user.id)
                .eq('type', 'admin')
                .limit(1)
                .maybeSingle();

            if (!staff?.business_id) return [];

            const { data, error } = await supabase
                .from('loyalty_programs')
                .select(PROGRAM_WITH_BUSINESS)
                .eq('business_id', staff.business_id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return (data ?? []) as StoredLoyaltyProgram[];
        },

        getByPublicId: async (publicId: string) => {
            const supabase = getClient();
            const { data, error } = await supabase
                .from('loyalty_programs')
                .select(PROGRAM_WITH_BUSINESS)
                .eq('public_id', publicId)
                .eq('is_active', true)
                .maybeSingle();
            if (error) throw error;
            return data as StoredLoyaltyProgram | null;
        },
    };
}
