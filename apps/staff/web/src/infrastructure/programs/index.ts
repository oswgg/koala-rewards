import { ProgramsRepository } from '@vado/loyalty';
import { createClient } from '../supabase/client';
import { ProgramsRepositoryImpl, SupabaseProgramsRemoteDataSource } from '@vado/loyalty/data';

const remoteDataSource = new SupabaseProgramsRemoteDataSource(createClient());

const programsRepository: ProgramsRepository = new ProgramsRepositoryImpl(remoteDataSource);

export { programsRepository };
