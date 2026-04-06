import { ProfilesRepository } from '@vado/loyalty';
import { createClient } from '@/infrastructure/supabase/client';
import { ProfilesRepositoryImpl, SupabaseProfilesRemoteDataSource } from '@vado/loyalty/data';

const remoteDataSource = new SupabaseProfilesRemoteDataSource(createClient());

const profilesRepository: ProfilesRepository = new ProfilesRepositoryImpl(remoteDataSource);

export { profilesRepository };
