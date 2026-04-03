import { AuthRepository } from '@koalacards/loyalty';
import {
    AuthRepositoryImpl,
    ClientSupabaseAuthIdentityRemoteDatasource,
    SupabaseRemoteAuthDataSource,
} from '@koalacards/loyalty/data';
import { createClient } from '../supabase/client';

const supabase = createClient();
const remoteDataSource = new SupabaseRemoteAuthDataSource(supabase);
const identityDatasource = new ClientSupabaseAuthIdentityRemoteDatasource(supabase);

const authRepository: AuthRepository = new AuthRepositoryImpl(remoteDataSource, identityDatasource);

export { authRepository };
