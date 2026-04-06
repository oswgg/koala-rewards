import { BusinessesRepository } from '@vado/loyalty';
import {
    BusinessesRepositoryImpl,
    SupabaseBusinessesRemoteDataSource,
} from '@vado/loyalty/data';
import { createClient } from '../supabase/client';

const remoteDataSource = new SupabaseBusinessesRemoteDataSource(createClient());

const businessRepository: BusinessesRepository = new BusinessesRepositoryImpl(remoteDataSource);

export { businessRepository };
