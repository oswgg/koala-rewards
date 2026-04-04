import { ProfilesRepository } from '@koalacards/loyalty';
import { createClient } from '@/infrastructure/supabase/client';
import { ProfilesRepositoryImpl, SupabaseProfilesRemoteDataSource } from '@koalacards/loyalty/data';

const remoteDataSource = new SupabaseProfilesRemoteDataSource(createClient());

const profilesRepository: ProfilesRepository = new ProfilesRepositoryImpl(remoteDataSource);

export { profilesRepository };
