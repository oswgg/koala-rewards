import type { ProgramSnapshot } from '../types/membership-datasource.types';
import type { MembershipWithProgram, ProgramMembership } from '../types/membership';

export interface JoinProgramResult {
    membership: MembershipWithProgram;
    createdOffline: boolean;
}

export interface MembershipsRepository {
    create(programId: string, userId: string): Promise<ProgramMembership>;
    createByProgramPublicId(
        programPublicId: string,
        userId: string,
        programSnapshot: ProgramSnapshot
    ): Promise<JoinProgramResult>;
    hasMembership(programId: string, userId: string): Promise<boolean>;
    hasMembershipByProgramPublicId(programPublicId: string, userId: string): Promise<boolean>;
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
    syncPending(): Promise<void>;
}
