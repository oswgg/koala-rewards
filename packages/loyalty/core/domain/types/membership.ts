import { Business } from './business';
import { CardThemeName } from './card-theme';
import type { LoyaltyProgramType, StoredLoyaltyProgram } from './loyalty-program';

export interface ProgramMembership {
    id: string;
    program_id: string;
    profile_id: string;
    balance: number;
    created_at: string;
    public_id: string;
    business: Business;
}

export interface MembershipWithProgram extends ProgramMembership {
    program: StoredLoyaltyProgram;
}

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error';

export interface ProgramSnapshot {
    id: string;
    public_id: string;
    name: string;
    type: LoyaltyProgramType;
    reward_description: string | null;
    reward_cost: number | null;
    cashback_percentage: number | null;
    points_percentage: number | null;
    card_theme?: CardThemeName;
    business: {
        id: string;
        name: string;
        slug: string;
        created_at?: string;
    };
}

export interface LocalMembership {
    id: string;
    program_id: string;
    user_id: string;
    balance: number;
    created_at: string;
    syncStatus: SyncStatus;
    profile_id?: string;
    public_id?: string;
    remote_id?: string;
    program_public_id?: string;
    syncError?: string;
    program?: ProgramSnapshot;
}
