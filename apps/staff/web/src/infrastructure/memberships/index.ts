import { createClient } from '../supabase/client';
import { MembershipsRepository } from '@vado/loyalty';
import {
    MembershipsRepositoryImpl,
    SupabaseMembershipsRemoteDataSource,
} from '@vado/loyalty/data';

const remoteDataSource = new SupabaseMembershipsRemoteDataSource(createClient());
const isOnline = () => typeof navigator !== 'undefined' && navigator.onLine;

const membershipRepository: MembershipsRepository = new MembershipsRepositoryImpl(
    remoteDataSource,
    {} as any,
    isOnline
);

export { membershipRepository };
