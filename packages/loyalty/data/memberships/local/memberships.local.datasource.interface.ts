import type { LocalMembership } from '@vado/loyalty/core';

export interface LocalMembershipDataSource {
    save(membership: LocalMembership): Promise<LocalMembership>;
    update(programId: string, userId: string, changes: Partial<LocalMembership>): Promise<void>;
    delete(programId: string, userId: string): Promise<void>;
    getByUserId(userId: string): Promise<LocalMembership[]>;
    getPending(): Promise<LocalMembership[]>;
    hasMembership(programId: string, userId: string): Promise<boolean>;
    hasMembershipByProgramPublicId(programPublicId: string, userId: string): Promise<boolean>;
}
