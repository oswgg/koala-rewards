import type { SupabaseClient } from '@supabase/supabase-js';
import { isAuthApiError } from '@supabase/auth-js';
import type { AuthService } from './auth-service.interface';
import type { User } from '../../types/user';
import { toUser } from '../../lib/user-mapper';

export function createSupabaseAuthService(getClient: () => SupabaseClient): AuthService {
    return {
        createUser: async (email: string, name: string, phoneNumber: string) => {
            const supabase = getClient();
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    data: {
                        name,
                        phone_number: phoneNumber,
                    },
                },
            });
            if (error) throw error;
        },

        sendOtp: async (email: string) => {
            const supabase = getClient();
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { shouldCreateUser: false },
            });
            if (error) {
                if (
                    isAuthApiError(error) &&
                    (error.code === 'user_not_found' || error.code === 'signup_disabled')
                ) {
                    throw new Error('Este correo no está registrado. Regístrate primero.');
                }
                throw error;
            }
        },

        verifyOtp: async (email: string, code: string): Promise<User> => {
            const supabase = getClient();
            const { data, error } = await supabase.auth.verifyOtp({
                type: 'email',
                email,
                token: code,
            });

            if (error || !data.user) throw error;

            return toUser(data.user)!;
        },

        getCurrentUser: async (): Promise<User | null> => {
            const supabase = getClient();
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
                const { data } = await supabase.auth.getSession();
                return toUser(data.session?.user ?? null);
            }
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();
            if (error) throw error;
            return toUser(user);
        },

        signOut: async () => {
            const supabase = getClient();
            await supabase.auth.signOut();
        },

        subscribeToAuthChanges: (callback: (user: User | null) => void) => {
            const supabase = getClient();
            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange((_event, session) => {
                callback(toUser(session?.user ?? null));
            });
            return () => subscription.unsubscribe();
        },
    };
}
