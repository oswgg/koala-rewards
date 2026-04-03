import { BusinessesRepository } from '@koalacards/loyalty';
import {
    BusinessesRepositoryImpl,
    SupabaseBusinessesRemoteDataSource,
} from '@koalacards/loyalty/data';
import { createClient } from '../supabase/client';

const remoteDataSource = new SupabaseBusinessesRemoteDataSource(createClient());

const businessRepository: BusinessesRepository = new BusinessesRepositoryImpl(remoteDataSource);

export { businessRepository };
