import type { CardThemeName } from '@/shared/lib/card-themes';
import { Business } from './business';

export type LoyaltyProgramType = 'points' | 'cashback' | 'stamps';

interface BaseProgram {
    name: string;
    limit_one_per_day: boolean;
    card_theme?: CardThemeName;
}

interface ImmutableStoredFields {
    id: string;
    business_id: string;
    created_at: string;
    public_id: string;
}

interface MutableStoredFields {
    is_active: boolean;
}

export interface PointsProgram extends BaseProgram {
    type: 'points';
    points_percentage: number;
    cashback_percentage: null;
    reward_description: string;
    reward_cost: number;
}

export interface CashbackProgram extends BaseProgram {
    type: 'cashback';
    cashback_percentage: number;
    points_percentage: null;
    reward_description: null;
    reward_cost: null;
}

export interface StampsProgram extends BaseProgram {
    type: 'stamps';
    points_percentage: null;
    cashback_percentage: null;
    reward_description: string;
    reward_cost: number;
}

export type LoyaltyProgram = PointsProgram | CashbackProgram | StampsProgram;

export type StoredLoyaltyProgram = ImmutableStoredFields &
    MutableStoredFields &
    LoyaltyProgram & {
        business: Business;
    };

export type CreateProgramInput = LoyaltyProgram;

export type UpdateProgramInput = Partial<LoyaltyProgram> & Partial<MutableStoredFields>;
