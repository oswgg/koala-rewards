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
