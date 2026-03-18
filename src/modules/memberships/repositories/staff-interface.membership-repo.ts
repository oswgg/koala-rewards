import type { MembershipWithProgram } from '../services/interface.membership-service';

export interface StaffMembershipRepository {
    createMembership(programPublicId: string, userId: string): Promise<void>;
    findUserMembership(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram[]>;
}
