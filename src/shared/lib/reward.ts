import type { StoredLoyaltyProgram } from '@/shared/types/loyalty-program';

/**
 * Indica si el usuario tiene saldo suficiente para canjear su recompensa.
 * Solo aplica a stamps y points; cashback no tiene recompensa canjeable.
 */
export function isRewardReady(program: StoredLoyaltyProgram, balance: number): boolean {
    if (program.type === 'cashback' || program.reward_cost == null) return false;
    return balance >= program.reward_cost;
}
