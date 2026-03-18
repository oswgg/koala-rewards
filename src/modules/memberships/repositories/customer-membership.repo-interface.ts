import { ProgramSnapshot } from '../datasources/types.membership-datasource';
import { MembershipWithProgram } from '../services/interface.membership-service';

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
