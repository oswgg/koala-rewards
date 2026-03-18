import type { ProgramMembership } from '@/shared/types/membership';
import type { LoyaltyProgramType, StoredLoyaltyProgram } from '@/shared/types/loyalty-program';

export interface MembershipWithProgram extends ProgramMembership {
    program: StoredLoyaltyProgram;
}

export interface MembershipService {
    create(programId: string, userId: string): Promise<ProgramMembership>;
    hasMembership(programId: string, userId: string): Promise<boolean>;
    getByUserId(userId: string): Promise<MembershipWithProgram[]>;
    getByPublicId(publicId: string): Promise<MembershipWithProgram | null>;
    getByProgramIdAndUserId(
        programId: string,
        userId: string
    ): Promise<MembershipWithProgram | null>;
    getByProgramPublicIdAndUserId(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram | null>;
    createByProgramPublicIdAndUserId(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram | null>;
}
