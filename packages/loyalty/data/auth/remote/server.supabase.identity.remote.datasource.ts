import { toUser } from '@koalacards/loyalty/core/lib/user-mapper';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthIdentityRemoteDatasource } from './auth.identity.remote.datasource';

export class ServerSupbaseAuthIdentityRemoteDatasource implements AuthIdentityRemoteDatasource {
    constructor(private readonly supabase: SupabaseClient) {}

    async getCurrentUser() {
        const {
            data: { user },
            error,
        } = await this.supabase.auth.getUser();

        if (error) return null;

        return toUser(user);
    }
}
