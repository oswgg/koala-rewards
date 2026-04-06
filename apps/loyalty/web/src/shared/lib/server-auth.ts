import { cookies } from 'next/headers';
import { createClient } from '@/infrastructure/supabase/server';
import type { AuthRepository } from '@vado/loyalty';
import {
    AuthRepositoryImpl,
    ServerSupbaseAuthIdentityRemoteDatasource,
    SupabaseRemoteAuthDataSource,
} from '@vado/loyalty/data';

export function getServerAuthRepository(): AuthRepository {
    const supabase = createClient(cookies());
    const remoteDataSource = new SupabaseRemoteAuthDataSource(supabase);
    const identityDatasource = new ServerSupbaseAuthIdentityRemoteDatasource(supabase);

    return new AuthRepositoryImpl(remoteDataSource, identityDatasource);
}
