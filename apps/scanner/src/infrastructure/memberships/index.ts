import { createClient } from '../supabase/client';
import { MembershipsRepository } from '@koalacards/loyalty';
import {
    MembershipsRepositoryImpl,
    SupabaseMembershipsRemoteDataSource,
} from '@koalacards/loyalty/data';

const remoteDataSource = new SupabaseMembershipsRemoteDataSource(createClient());
const isOnline = () => typeof navigator !== 'undefined' && navigator.onLine;

const membershipRepository: MembershipsRepository = new MembershipsRepositoryImpl(
    remoteDataSource,
    {} as any,
    isOnline
);

export { membershipRepository };
