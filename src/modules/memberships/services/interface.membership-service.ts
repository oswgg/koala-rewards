import type { ProgramMembership } from '@/shared/types/membership';
import type { StoredLoyaltyProgram } from '@/shared/types/loyalty-program';

export interface MembershipWithProgram extends ProgramMembership {
    program: StoredLoyaltyProgram;
}

export interface MembershipService {
    create(programId: string, userId: string): Promise<ProgramMembership>;
    createWithClientId(
        programId: string,
        userId: string,
        membershipClientId: string
    ): Promise<ProgramMembership>;
    hasMembership(programId: string, userId: string): Promise<boolean>;
    getByUserId(userId: string): Promise<MembershipWithProgram[]>;
    getByPublicId(publicId: string): Promise<MembershipWithProgram | null>;
    getByClientId(membershipClientId: string): Promise<MembershipWithProgram | null>;
}
