import Dexie, { type Table } from 'dexie';
import type { LocalMembership, LocalMembershipDataSource } from './types.membership-datasource';

const DB_NAME = 'koalacards-offline';
const DB_VERSION = 2;

class MembershipDexie extends Dexie {
    memberships!: Table<LocalMembership>;

    constructor() {
        super(DB_NAME);
        this.version(DB_VERSION).stores({
            memberships: 'id, program_id, user_id, syncStatus, [user_id+program_id]',
        });
    }
}

const db = new MembershipDexie();

export class DexieMembershipDataSource implements LocalMembershipDataSource {
    async save(membership: LocalMembership): Promise<LocalMembership> {
        const id = await db.memberships.add(membership);
        return (await db.memberships.get(id)) as LocalMembership;
    }

    async update(
        programId: string,
        userId: string,
        changes: Partial<LocalMembership>
    ): Promise<void> {
        await db.memberships
            .where('program_id')
            .equals(programId)
            .filter((m) => m.user_id === userId)
            .modify(changes);
    }

    async delete(programId: string, userId: string): Promise<void> {
        await db.memberships
            .where('program_id')
            .equals(programId)
            .filter((m) => m.user_id === userId)
            .delete();
    }

    async getByUserId(userId: string): Promise<LocalMembership[]> {
        return db.memberships.where('user_id').equals(userId).toArray();
    }

    async getPending(): Promise<LocalMembership[]> {
        return db.memberships.where('syncStatus').anyOf(['pending', 'error']).toArray();
    }

    async hasMembership(programId: string, userId: string): Promise<boolean> {
        const record = await db.memberships
            .where('program_id')
            .equals(programId)
            .filter((m) => m.user_id === userId)
            .first();
        return record !== undefined;
    }

    async hasMembershipByProgramPublicId(
        programPublicId: string,
        userId: string
    ): Promise<boolean> {
        const records = await db.memberships
            .where('user_id')
            .equals(userId)
            .filter((m) => m.program?.public_id === programPublicId)
            .first();
        return records !== undefined;
    }
}
