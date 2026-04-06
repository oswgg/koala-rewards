import { CreateProgramInput, StoredLoyaltyProgram } from '@vado/loyalty/core';

export interface ProgramsRemoteDataSource {
    create(program: CreateProgramInput): Promise<StoredLoyaltyProgram>;
    getAll(): Promise<StoredLoyaltyProgram[]>;
    getByPublicId(programId: string): Promise<StoredLoyaltyProgram | null>;
}
