import {
    CreateProgramInput,
    LoyaltyProgram,
    StoredLoyaltyProgram,
} from '@/shared/types/loyalty-program';

export interface ProgramsService {
    create(program: CreateProgramInput): Promise<StoredLoyaltyProgram>;
    getAll(): Promise<StoredLoyaltyProgram[]>;
    getByPublicId(publicId: string): Promise<StoredLoyaltyProgram | null>;
}
