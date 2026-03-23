import { AuthService } from './interface.auth-service';
import { supabaseAuthService } from './supabase.auth-service';
import { User as SupabaseUser } from '@supabase/auth-js';
import { User } from '@/shared/types/user';

export const authService: AuthService = supabaseAuthService;

export function toUser(supabaseUser: SupabaseUser | null): User | null {
    if (!supabaseUser?.email) return null;
    const meta = supabaseUser.user_metadata as {
        name?: string;
        phone_number?: string;
    };
    return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: meta.name ?? '',
        ...(meta.phone_number != null && meta.phone_number !== ''
            ? { phoneNumber: meta.phone_number }
            : {}),
    };
}
