import {
    CreateProgramInput,
    StoredLoyaltyProgram,
} from '@vado/loyalty/core/domain/types/loyalty-program';

export interface ProgramsRemoteDataSource {
    create(program: CreateProgramInput): Promise<StoredLoyaltyProgram>;
    getAll(): Promise<StoredLoyaltyProgram[]>;
    getByPublicId(programId: string): Promise<StoredLoyaltyProgram | null>;
}
