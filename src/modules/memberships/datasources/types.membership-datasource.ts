import { CardThemeName } from '@/shared/lib/card-themes';
import type { MembershipWithProgram } from '../services/interface.membership-service';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error';

/** Minimal program snapshot for offline card display */
export interface ProgramSnapshot {
    id: string;
    public_id: string;
    name: string;
    type: string;
    reward_description: string;
    reward_cost: number | null;
    cashback_percentage: number | null;
    points_percentage: number | null;
    card_theme?: CardThemeName;
    business: { id: string; name: string; slug: string; created_at?: string };
    business_id?: string;
}

/** Local membership stored in IndexedDB for offline-first */
export interface LocalMembership {
    id: string;
    program_id: string;
    /** When creating offline with only public_id, we store it here for sync */
    program_public_id?: string;
    /** Supabase Auth `auth.users.id` (owner of the offline row). */
    user_id: string;
    /** `profiles.id` once known from the server. */
    profile_id?: string;
    balance: number;
    created_at: string;
    public_id?: string;
    /** Server id after sync (for display) */
    remote_id?: string;
    syncStatus: SyncStatus;
    syncError?: string;
    /** Program snapshot for offline display (when not yet synced) */
    program?: ProgramSnapshot;
}

export interface RemoteMembershipDataSource {
    create(programId: string, userId: string): Promise<MembershipWithProgram>;
    createByProgramPublicId(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram>;
    hasMembership(programId: string, userId: string): Promise<boolean>;
    hasMembershipByProgramPublicId(programPublicId: string, userId: string): Promise<boolean>;
    getByUserId(userId: string): Promise<MembershipWithProgram[]>;
    getByProgramIdAndUserId(
        programId: string,
        userId: string
    ): Promise<MembershipWithProgram | null>;
    getByProgramPublicIdAndUserId(
        programPublicId: string,
        userId: string
    ): Promise<MembershipWithProgram | null>;
}

export interface LocalMembershipDataSource {
    save(membership: LocalMembership): Promise<LocalMembership>;
    update(programId: string, userId: string, changes: Partial<LocalMembership>): Promise<void>;
    delete(programId: string, userId: string): Promise<void>;
    getByUserId(userId: string): Promise<LocalMembership[]>;
    getPending(): Promise<LocalMembership[]>;
    hasMembership(programId: string, userId: string): Promise<boolean>;
    hasMembershipByProgramPublicId(programPublicId: string, userId: string): Promise<boolean>;
}
