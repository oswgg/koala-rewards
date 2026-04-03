import type { LoyaltyProgramType } from '../domain/types/loyalty-program';

/**
 * Indica si el usuario tiene saldo suficiente para canjear su recompensa.
 * Solo aplica a stamps y points; cashback no tiene recompensa canjeable.
 */
export function isRewardReady({
    programType,
    rewardCost,
    balance,
}: {
    programType: LoyaltyProgramType;
    rewardCost: number;
    balance: number;
}): boolean {
    if (programType === 'cashback' || rewardCost == null) return false;
    return balance >= rewardCost;
}
