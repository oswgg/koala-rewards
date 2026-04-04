import type { AuthRepository, User } from '@vado/loyalty';
import {
    AuthRepositoryImpl,
    ServerSupbaseAuthIdentityRemoteDatasource,
    SupabaseRemoteAuthDataSource,
} from '@vado/loyalty/data';
import { createClient } from '../supabase/server';

type CookieStore = Awaited<ReturnType<typeof import('next/headers').cookies>>;

function createServerAuthRepository(cookieStore: CookieStore): AuthRepository {
    const supabase = createClient(Promise.resolve(cookieStore));
    const remoteDataSource = new SupabaseRemoteAuthDataSource(supabase);
    const identityDatasource = new ServerSupbaseAuthIdentityRemoteDatasource(supabase);

    return new AuthRepositoryImpl(remoteDataSource, identityDatasource);
}

export async function getServerAuthUser(cookieStore: CookieStore): Promise<User | null> {
    const authRepository = createServerAuthRepository(cookieStore);
    return authRepository.getCurrentUser();
}