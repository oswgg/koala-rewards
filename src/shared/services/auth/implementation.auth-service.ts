import { AuthService } from './interface.auth-service';
import { supabaseAuthService } from './supabase.auth-service';
import { User as SupabaseUser } from '@supabase/auth-js';
import { User } from '@/shared/types/user';

export const authService: AuthService = supabaseAuthService;

export function toUser(supabaseUser: SupabaseUser | null): User | null {
    if (!supabaseUser?.email) return null;
    return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata.name,
    };
}
