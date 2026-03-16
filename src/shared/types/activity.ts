import { LoyaltyProgramType, StoredLoyaltyProgram } from './loyalty-program';
import { ProgramMembership } from './membership';

/** Valores del enum loyalty_activity_type en la BD. Ajustar si tu esquema usa otros. */
export type LoyaltyActivityType = 'earn' | 'redeem';

export interface ImmutableActivityStoredFields {
    id: string;
    registered_at: string;
    registered_by_staff_id: number;
}

export interface BaseActivity {
    membership_id: string;
    mermbership?: ProgramMembership;
    program_id: string;
    program?: StoredLoyaltyProgram;
    metadata: Record<string, unknown> | null;
}

export interface EarnActivity extends BaseActivity {
    type: 'earn';
    quantity: number;
}

export interface StampBasedActivity extends EarnActivity {
    /** Monto de la venta (opcional, para registro/analytics) */
    purchase_amount: number | null;
}

export interface PurchaseBasedActivity extends EarnActivity {
    purchase_amount: number;
}

export interface RedeemActivity extends BaseActivity {
    type: 'redeem';
    quantity: null;
    purchase_amount: null;
}

export type Activity = StampBasedActivity | PurchaseBasedActivity | RedeemActivity;

export interface BaseRegisterActivityInput {
    programType: LoyaltyProgramType | null;
    membershipId: string;
    programId: string;
}

export interface RegisterStampEarnInput extends BaseRegisterActivityInput {
    programType: 'stamps';
    type: 'earn';
    quantity: number;
    /** Monto de la venta (para registro/analytics; no afecta el cálculo de sellos) */
    purchaseAmount: number;
}

export interface RegisterPurchaseEarnInput extends BaseRegisterActivityInput {
    programType: 'points' | 'cashback';
    type: 'earn';
    quantity: number;
    purchaseAmount: number;
}

export interface RegisterRedeemInput extends BaseRegisterActivityInput {
    programType: null;
    type: 'redeem';
}

export type RegisterEarnActivityInput = RegisterStampEarnInput | RegisterPurchaseEarnInput;

export type RegisterRedeemActivityInput = RegisterRedeemInput;

/** Resultado de registrar una actividad de ganancia */
export interface RegisterEarnActivityResult {
    /** Lo que se suma en esta actividad (1 sello, X puntos, o X$ cashback) */
    earnedAmount: number;
    /** Nuevo balance de la tarjeta tras la actividad */
    newBalance: number;
}
