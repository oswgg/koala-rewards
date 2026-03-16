'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/infrastructure/supabase/client';
import { useAuthSession } from '@/shared/hooks/useAuthSession';

export interface Staff {
    id: number;
    business_id: string;
    user_id: string;
    type: string;
    name: string;
    email: string;
}

export function useStaff() {
    const { user, isAuthenticated } = useAuthSession();

    return useQuery({
        queryKey: ['staff', user?.id],
        queryFn: async (): Promise<Staff | null> => {
            if (!user?.id) return null;
            const supabase = createClient();
            const { data, error } = await supabase
                .from('staff')
                .select('id, business_id, user_id, type, name, email')
                .eq('user_id', user.id)
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: isAuthenticated && !!user?.id,
    });
}
