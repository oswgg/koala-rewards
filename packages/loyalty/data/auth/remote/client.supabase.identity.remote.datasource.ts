import { SupabaseClient } from '@supabase/supabase-js';
import { AuthIdentityRemoteDatasource } from './auth.identity.remote.datasource';
import { toUser } from '@koalacards/loyalty/core';

export class ClientSupabaseAuthIdentityRemoteDatasource implements AuthIdentityRemoteDatasource {
    constructor(private readonly supabase: SupabaseClient) {}

    async getCurrentUser() {
        const { data } = await this.supabase.auth.getSession();
        return toUser(data.session?.user ?? null);
    }
}
