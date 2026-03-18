import { createClient } from '@/infrastructure/supabase/client';
import type { StoredLoyaltyProgram } from '@/shared/types/loyalty-program';
import { ProgramsService } from './interface.programs-service';

const PROGRAM_WITH_BUSINESS = '*, business:businesses(*)';

export const supabaseProgramsService: ProgramsService = {
    create: async (program) => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('loyalty_programs')
            .insert(program)
            .select(PROGRAM_WITH_BUSINESS)
            .single();

        if (error) throw error;

        return data as StoredLoyaltyProgram;
    },

    getAll: async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('loyalty_programs')
            .select(PROGRAM_WITH_BUSINESS)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data ?? []) as StoredLoyaltyProgram[];
    },

    getByPublicId: async (publicId: string) => {
        const supabase = createClient();
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
