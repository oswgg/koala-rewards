import { MembershipActivitiesRepository } from '@koalacards/loyalty';
import { createClient } from '../supabase/client';
import {
    MembershipActivitiesRealtimeService,
    MembershipActivitiesRepositoryImpl,
    SupabaseMembershipActivitiesRealtimeService,
    SupabaseMembershipActivitiesRemoteDataSource,
} from '@koalacards/loyalty/data';

const remoteDataSource = new SupabaseMembershipActivitiesRemoteDataSource(createClient());

const membershipActivitiesRepository: MembershipActivitiesRepository =
    new MembershipActivitiesRepositoryImpl(remoteDataSource);

const membershipActivitiesRealtimeClient: MembershipActivitiesRealtimeService =
    new SupabaseMembershipActivitiesRealtimeService(createClient());

export { membershipActivitiesRepository, membershipActivitiesRealtimeClient };
