import { ProgramsRemoteDataSource } from './remote/programs.remote.datasource.interface';
import { CreateProgramInput, StoredLoyaltyProgram, ProgramsRepository } from '@vado/loyalty/core';

export class ProgramsRepositoryImpl implements ProgramsRepository {
    constructor(private readonly remote: ProgramsRemoteDataSource) {}

    async create(program: CreateProgramInput): Promise<StoredLoyaltyProgram> {
        return await this.remote.create(program);
    }

    async getAll(): Promise<StoredLoyaltyProgram[]> {
        const data = await this.remote.getAll();
        return data;
    }

    async getByPublicId(publicId: string): Promise<StoredLoyaltyProgram | null> {
        return await this.remote.getByPublicId(publicId);
    }
}
