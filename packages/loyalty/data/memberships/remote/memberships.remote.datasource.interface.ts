import type {
    MembershipWithProgram,
    ProgramMembership,
} from '@koalacards/loyalty/core/domain/types/membership';

export interface RemoteMembershipDataSource {
    create(programId: string, userId: string): Promise<ProgramMembership>;
    hasMembership(programId: string, userId: string): Promise<boolean>;
    getByUserId(userId: string): Promise<MembershipWithProgram[]>;
    getByPublicId(publicId: string): Promise<MembershipWithProgram | null>;
    getByProgramIdAndUserId(
        programId: string,
        userId: string
    ): Promise<MembershipWithProgram | null>;
    getByProgramIdAndProfileId(
        programId: string,
        profileId: string
    ): Promise<MembershipWithProgram | null>;
    getByProgramPublicIdAndUserId(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram | null>;
    getByProgramPublicIdAndProfileId(
        programPublicId: string,
        profileId: string
    ): Promise<MembershipWithProgram | null>;
    createByProgramPublicIdAndUserId(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram | null>;
    createByProgramPublicIdAndProfileId(
        programPublicId: string,
        profileId: string
    ): Promise<MembershipWithProgram | null>;
    hasEarnActivityToday(membershipId: string): Promise<boolean>;
}
