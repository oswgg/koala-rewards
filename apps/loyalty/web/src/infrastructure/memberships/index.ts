import { createClient } from '../supabase/client';
import { MembershipsRepository } from '@vado/loyalty';
import {
    MembershipsRepositoryImpl,
    SupabaseMembershipsRemoteDataSource,
} from '@vado/loyalty/data';
import { DexieMembershipDataSource } from '@/modules/memberships/datasources/dexie-membership.datasource';

const remoteDataSource = new SupabaseMembershipsRemoteDataSource(createClient());
const localDataSource = new DexieMembershipDataSource();
const isOnline = () => typeof navigator !== 'undefined' && navigator.onLine;

const membershipRepository: MembershipsRepository = new MembershipsRepositoryImpl(
    remoteDataSource,
    localDataSource,
    isOnline
);

export { membershipRepository };
