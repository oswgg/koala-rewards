import { CreateProgramInput, StoredLoyaltyProgram } from '../types/loyalty-program';

export interface ProgramsRepository {
    create(program: CreateProgramInput): Promise<StoredLoyaltyProgram>;
    getAll(): Promise<StoredLoyaltyProgram[]>;
    getByPublicId(publicId: string): Promise<StoredLoyaltyProgram | null>;
}
