import { ProgramsRepository } from '@koalacards/loyalty';
import { createClient } from '../supabase/client';
import { ProgramsRepositoryImpl, SupabaseProgramsRemoteDataSource } from '@koalacards/loyalty/data';

const remoteDataSource = new SupabaseProgramsRemoteDataSource(createClient());

const programsRepository: ProgramsRepository = new ProgramsRepositoryImpl(remoteDataSource);

export { programsRepository };
