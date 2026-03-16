import { Business } from './business';

export type LoyaltyProgramType = 'points' | 'cashback' | 'stamps';

interface BaseProgram {
    name: string;
    reward_description: string;
    limit_one_per_day: boolean;
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
    reward_cost: number;
}

export interface CashbackProgram extends BaseProgram {
    type: 'cashback';
    cashback_percentage: number;
    points_percentage: null;
    reward_cost: null;
}

export interface StampsProgram extends BaseProgram {
    type: 'stamps';
    reward_cost: number;
    points_percentage: null;
    cashback_percentage: null;
}

export type LoyaltyProgram = PointsProgram | CashbackProgram | StampsProgram;

export type StoredLoyaltyProgram = ImmutableStoredFields &
    MutableStoredFields &
    LoyaltyProgram & {
        business: Business;
    };

export type CreateProgramInput = LoyaltyProgram;

export type UpdateProgramInput = Partial<LoyaltyProgram> & Partial<MutableStoredFields>;
