import { CreateProgramInput, StoredLoyaltyProgram } from '@koalacards/loyalty/core';
import { ProgramsRemoteDataSource } from '@koalacards/loyalty/data/programs/remote/programs.remote.datasource.interface';
import { ProgramsRepository } from '@koalacards/loyalty/core/domain/repositories/programs.repo.interface';

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
