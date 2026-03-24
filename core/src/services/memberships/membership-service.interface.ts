import type { ProgramMembership } from '../../types/membership';
import type { StoredLoyaltyProgram } from '../../types/loyalty-program';

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
    /** `profileId` = `profiles.id` (no auth lookup). */
    getByProgramIdAndProfileId(
        programId: string,
        profileId: string
    ): Promise<MembershipWithProgram | null>;
    getByProgramPublicIdAndUserId(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram | null>;
    /** `profileId` = `profiles.id` (no auth lookup). */
    getByProgramPublicIdAndProfileId(
        programPublicId: string,
        profileId: string
    ): Promise<MembershipWithProgram | null>;
    createByProgramPublicIdAndUserId(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram | null>;
    /** `profileId` = `profiles.id` (no auth lookup). */
    createByProgramPublicIdAndProfileId(
        programPublicId: string,
        profileId: string
    ): Promise<MembershipWithProgram | null>;
    hasEarnActivityToday(membershipId: string): Promise<boolean>;
}
