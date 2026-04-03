import { User } from '@koalacards/loyalty/core/domain/types/user';
import { toUser } from '@koalacards/loyalty/core/lib/user-mapper';
import { RemoteAuthDataSource } from './auth.remote.datasource.interface';
import { isAuthApiError, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseRemoteAuthDataSource implements RemoteAuthDataSource {
    constructor(private readonly supabase: SupabaseClient) {}

    async createUser(email: string, name: string, phoneNumber: string): Promise<void> {
        const { error } = await this.supabase.auth.signInWithOtp({
            email,
            options: {
                data: {
                    name,
                    phone_number: phoneNumber,
                },
            },
        });
        if (error) throw error;
    }

    async sendOtp(email: string): Promise<void> {
        const { error } = await this.supabase.auth.signInWithOtp({
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
    }

    async verifyOtp(email: string, code: string): Promise<User> {
        const { data, error } = await this.supabase.auth.verifyOtp({
            type: 'email',
            email,
            token: code,
        });

        if (error || !data.user) throw error;

        return toUser(data.user)!;
    }

    async isBusinessOwner(userId: any): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', userId)
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return Boolean(data);
    }

    async isBusinessStaff(userId: any): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('staff')
            .select('id')
            .eq('user_id', userId)
            .eq('active', true)
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return Boolean(data);
    }

    async signOut(): Promise<void> {
        await this.supabase.auth.signOut();
    }
}
