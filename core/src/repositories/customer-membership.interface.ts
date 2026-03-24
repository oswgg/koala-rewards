import type { ProgramSnapshot } from '../datasources/memberships/membership-datasource.types';
import type { MembershipWithProgram } from '../services/memberships/membership-service.interface';

export interface JoinProgramResult {
    membership: MembershipWithProgram;
    createdOffline: boolean;
}

export interface CustomerMembershipRepository {
    create(
        programId: string,
        userId: string,
        programSnapshot?: ProgramSnapshot
    ): Promise<MembershipWithProgram>;
    createByProgramPublicId(
        programPublicId: string,
        userId: string,
        programSnapshot: ProgramSnapshot
    ): Promise<JoinProgramResult>;
    getByUserId(userId: string): Promise<MembershipWithProgram[]>;
    hasMembership(programId: string, userId: string): Promise<boolean>;
    hasMembershipByProgramPublicId(programPublicId: string, userId: string): Promise<boolean>;
    syncPending(): Promise<void>;
}
