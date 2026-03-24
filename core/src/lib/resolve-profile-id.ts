import type { SupabaseClient } from '@supabase/supabase-js';

/** Resolves `profiles.id` for a Supabase Auth user (`auth.users.id`). */
export async function getProfileIdByAuthUserId(
    supabase: SupabaseClient,
    authUserId: string
): Promise<string | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', authUserId)
        .maybeSingle();

    if (error) throw error;
    return data?.id ?? null;
}
